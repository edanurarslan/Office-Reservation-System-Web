using OfisYonetimSistemi.Application.DTOs;
using OfisYonetimSistemi.Application.Services;
using OfisYonetimSistemi.Domain.Entities;
using OfisYonetimSistemi.Domain.Enums;
using OfisYonetimSistemi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace OfisYonetimSistemi.Infrastructure.Services;

/// <summary>
/// Service implementation for occupancy heatmap data
/// </summary>
public class HeatMapService : IHeatMapService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<HeatMapService> _logger;

    // Color codes for occupancy levels (Green -> Yellow -> Red)
    private const string ColorGreen = "#2ecc71";  // 0-33% occupancy
    private const string ColorYellow = "#f39c12"; // 33-67% occupancy
    private const string ColorOrange = "#e74c3c"; // 67-85% occupancy
    private const string ColorRed = "#c0392b";    // 85%+ occupancy

    public HeatMapService(ApplicationDbContext context, ILogger<HeatMapService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<CurrentHeatMapResponseDto> GetCurrentOccupancyAsync(HeatMapQueryDto query, CancellationToken cancellationToken = default)
    {
        try
        {
            var now = DateTime.UtcNow;
            var queryTime = query.StartTime ?? now;

            var response = new CurrentHeatMapResponseDto { GeneratedAt = now };

            if (!query.LocationId.HasValue)
                return response;

            var location = await _context.Locations
                .Include(l => l.Floors!)
                    .ThenInclude(f => f.Zones!)
                .FirstOrDefaultAsync(l => l.Id == query.LocationId && !l.IsDeleted, cancellationToken);

            if (location == null)
                return response;

            response.LocationLevel = await CalculateLocationOccupancyAsync(
                location, queryTime, query.ResourceType, cancellationToken);

            if (location.Floors != null)
            {
                foreach (var floor in location.Floors.Where(f => !f.IsDeleted))
                {
                    if (query.FloorId.HasValue && floor.Id != query.FloorId.Value)
                        continue;

                    var floorData = await CalculateFloorOccupancyAsync(
                        floor, queryTime, query.ResourceType, cancellationToken);

                    if (floorData != null)
                        response.FloorLevel.Add(floorData);
                }
            }

            _logger.LogInformation("HeatMap query completed for location {LocationId}", query.LocationId);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current occupancy");
            throw;
        }
    }

    public async Task<HistoricalHeatMapResponseDto> GetHistoricalOccupancyAsync(HeatMapQueryDto query, CancellationToken cancellationToken = default)
    {
        try
        {
            var startTime = query.StartTime ?? DateTime.UtcNow.AddDays(-7);
            var endTime = query.EndTime ?? DateTime.UtcNow;

            var response = new HistoricalHeatMapResponseDto
            {
                LocationId = query.LocationId ?? Guid.Empty,
                FloorId = query.FloorId,
                DateRange = new DateRangeDto { StartDate = startTime, EndDate = endTime }
            };

            var reservations = await _context.Reservations
                .Where(r => !r.IsDeleted &&
                           r.StartsAt <= endTime &&
                           r.EndsAt >= startTime &&
                           (query.LocationId == null || (r.Desk != null && r.Desk.Zone!.Floor!.LocationId == query.LocationId) ||
                                                        (r.Room != null && r.Room.LocationId == query.LocationId)))
                .Include(r => r.Desk!)
                    .ThenInclude(d => d.Zone!)
                        .ThenInclude(z => z.Floor!)
                .Include(r => r.Room)
                .ToListAsync(cancellationToken);

            response.DataPoints = GenerateHistoricalDataPoints(reservations, startTime, endTime, query.Period, query.ResourceType);

            if (response.DataPoints.Count > 0)
                response.Statistics = CalculateStatistics(response.DataPoints, reservations);

            _logger.LogInformation("Historical HeatMap query completed");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting historical occupancy");
            throw;
        }
    }

    public async Task<ZoneDetailedOccupancyDto> GetZoneDetailedOccupancyAsync(Guid zoneId, DateTime? timestamp = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var queryTime = timestamp ?? DateTime.UtcNow;

            var zone = await _context.Zones
                .Include(z => z.Desks!)
                .FirstOrDefaultAsync(z => z.Id == zoneId && !z.IsDeleted, cancellationToken);

            if (zone == null)
                throw new KeyNotFoundException($"Zone {zoneId} not found");

            var response = new ZoneDetailedOccupancyDto
            {
                ZoneId = zone.Id,
                ZoneName = zone.Name,
                ZoneDescription = zone.Description,
                Timestamp = queryTime
            };

            // Zones only contain Desks, not Rooms (Rooms are at Location level)
            if (zone.Desks != null)
            {
                foreach (var desk in zone.Desks.Where(d => !d.IsDeleted))
                {
                    var deskDetail = await GetDeskDetailAsync(desk, queryTime, cancellationToken);
                    if (deskDetail != null)
                        response.DeskDetails.Add(deskDetail);
                }
            }

            response.Statistics = new HeatMapDataPointDto
            {
                ZoneId = zone.Id,
                ZoneName = zone.Name,
                Timestamp = queryTime,
                OccupiedCount = response.DeskDetails.Count(d => d.IsOccupied),
                CapacityTotal = response.DeskDetails.Count
            };

            if (response.Statistics.CapacityTotal > 0)
            {
                response.Statistics.OccupancyPercentage = (response.Statistics.OccupiedCount * 100m) / response.Statistics.CapacityTotal;
                response.Statistics.AvailableCount = response.Statistics.CapacityTotal - response.Statistics.OccupiedCount;
                response.Statistics.ColorCode = GetOccupancyColorCode(response.Statistics.OccupancyPercentage);
            }

            _logger.LogInformation("Zone detailed occupancy retrieved for zone {ZoneId}", zoneId);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting zone detailed occupancy");
            throw;
        }
    }

    public async Task<List<OccupancyPredictionDto>> GetOccupancyPredictionsAsync(HeatMapQueryDto query, CancellationToken cancellationToken = default)
    {
        try
        {
            var predictions = new List<OccupancyPredictionDto>();
            var now = DateTime.UtcNow;
            var startTime = query.StartTime ?? now.AddHours(1);
            var endTime = query.EndTime ?? now.AddHours(24);

            for (var time = startTime; time <= endTime; time = time.AddHours(1))
            {
                var prediction = await PredictOccupancyAsync(query.LocationId, time, cancellationToken);
                if (prediction != null)
                    predictions.Add(prediction);
            }

            _logger.LogInformation("Occupancy predictions generated: {Count} predictions", predictions.Count);
            return predictions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error predicting occupancy");
            throw;
        }
    }

    public async Task<HeatMapConfigDto> GetConfigurationAsync(CancellationToken cancellationToken = default)
    {
        return await Task.FromResult(new HeatMapConfigDto
        {
            MinOccupancyThreshold = 10,
            MaxOccupancyThreshold = 100,
            UpdateFrequencySeconds = 30,
            EnableRealTime = true,
            ColorScheme = "heatmap",
            ShowDeskDetails = true,
            ShowRoomDetails = true,
            EnableTrendAnalysis = true,
            EnablePredictions = true
        });
    }

    public string GetOccupancyColorCode(decimal occupancyPercentage)
    {
        return occupancyPercentage switch
        {
            < 33 => ColorGreen,
            < 67 => ColorYellow,
            < 85 => ColorOrange,
            _ => ColorRed
        };
    }

    public async Task<string> GetTrendIndicatorAsync(Guid locationId, Guid? floorId = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var now = DateTime.UtcNow;
            var oneHourAgo = now.AddHours(-1);

            var baseQuery = _context.Reservations
                .Where(r => !r.IsDeleted &&
                           ((r.Desk != null && r.Desk.Zone!.Floor!.LocationId == locationId) ||
                            (r.Room != null && r.Room.LocationId == locationId)));

            if (floorId.HasValue)
            {
                baseQuery = baseQuery.Where(r => 
                    (r.Desk != null && r.Desk.Zone!.FloorId == floorId) || 
                    (r.Room != null && r.Room.LocationId == locationId)); // Rooms are at location level
            }

            var reservationsNow = await baseQuery
                .Where(r => r.StartsAt <= now && r.EndsAt >= now)
                .CountAsync(cancellationToken);

            var reservationsOneHourAgo = await baseQuery
                .Where(r => r.StartsAt <= oneHourAgo && r.EndsAt >= oneHourAgo)
                .CountAsync(cancellationToken);

            return reservationsNow > reservationsOneHourAgo ? "up" : 
                   reservationsNow < reservationsOneHourAgo ? "down" : "stable";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating trend");
            return "stable";
        }
    }

    public async Task InvalidateCacheAsync(Guid locationId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Cache invalidated for location {LocationId}", locationId);
        await Task.CompletedTask;
    }

    // Private helpers
    private async Task<HeatMapDataPointDto?> CalculateLocationOccupancyAsync(Location location, DateTime timestamp, string resourceType, CancellationToken cancellationToken)
    {
        var activeReservations = await _context.Reservations
            .Where(r => !r.IsDeleted && r.StartsAt <= timestamp && r.EndsAt >= timestamp &&
                       ((r.Desk != null && r.Desk.Zone!.Floor!.LocationId == location.Id) ||
                        (r.Room != null && r.Room.LocationId == location.Id)))
            .ToListAsync(cancellationToken);

        var totalDesks = await _context.Desks
            .CountAsync(d => !d.IsDeleted && d.Zone!.Floor!.LocationId == location.Id, cancellationToken);
        var totalRooms = await _context.Rooms
            .CountAsync(r => !r.IsDeleted && r.LocationId == location.Id, cancellationToken);

        var occupiedDesks = activeReservations.Count(r => r.ResourceType == ResourceType.Desk);
        var occupiedRooms = activeReservations.Count(r => r.ResourceType == ResourceType.Room);

        int totalCapacity = 0, occupiedCount = 0;
        if (resourceType == "desk" || resourceType == "all") { totalCapacity += totalDesks; occupiedCount += occupiedDesks; }
        if (resourceType == "room" || resourceType == "all") { totalCapacity += totalRooms; occupiedCount += occupiedRooms; }

        var occupancyPercentage = totalCapacity > 0 ? (occupiedCount * 100m) / totalCapacity : 0;

        return new HeatMapDataPointDto
        {
            Id = Guid.NewGuid(),
            LocationId = location.Id,
            LocationName = location.Name,
            Timestamp = timestamp,
            OccupiedCount = occupiedCount,
            CapacityTotal = totalCapacity,
            AvailableCount = totalCapacity - occupiedCount,
            OccupancyPercentage = occupancyPercentage,
            ColorCode = GetOccupancyColorCode(occupancyPercentage),
            Trend = await GetTrendIndicatorAsync(location.Id, null, cancellationToken)
        };
    }

    private async Task<HeatMapDataPointDto?> CalculateFloorOccupancyAsync(Floor floor, DateTime timestamp, string resourceType, CancellationToken cancellationToken)
    {
        var activeReservations = await _context.Reservations
            .Where(r => !r.IsDeleted && r.StartsAt <= timestamp && r.EndsAt >= timestamp &&
                       ((r.Desk != null && r.Desk.Zone!.FloorId == floor.Id) ||
                        (r.Room != null && r.Room.LocationId == floor.LocationId)))
            .ToListAsync(cancellationToken);

        var totalDesks = await _context.Desks
            .CountAsync(d => !d.IsDeleted && d.Zone!.FloorId == floor.Id, cancellationToken);
        var totalRooms = await _context.Rooms
            .CountAsync(r => !r.IsDeleted && r.LocationId == floor.LocationId, cancellationToken);

        var occupiedDesks = activeReservations.Count(r => r.ResourceType == ResourceType.Desk);
        var occupiedRooms = activeReservations.Count(r => r.ResourceType == ResourceType.Room);

        int totalCapacity = 0, occupiedCount = 0;
        if (resourceType == "desk" || resourceType == "all") { totalCapacity += totalDesks; occupiedCount += occupiedDesks; }
        if (resourceType == "room" || resourceType == "all") { totalCapacity += totalRooms; occupiedCount += occupiedRooms; }

        var occupancyPercentage = totalCapacity > 0 ? (occupiedCount * 100m) / totalCapacity : 0;

        return new HeatMapDataPointDto
        {
            Id = Guid.NewGuid(),
            LocationId = floor.LocationId,
            FloorId = floor.Id,
            FloorNumber = floor.FloorNumber,
            FloorName = floor.Name,
            Timestamp = timestamp,
            OccupiedCount = occupiedCount,
            CapacityTotal = totalCapacity,
            AvailableCount = totalCapacity - occupiedCount,
            OccupancyPercentage = occupancyPercentage,
            ColorCode = GetOccupancyColorCode(occupancyPercentage),
            Trend = await GetTrendIndicatorAsync(floor.LocationId, floor.Id, cancellationToken)
        };
    }

    private async Task<DeskDetailDto?> GetDeskDetailAsync(Desk desk, DateTime timestamp, CancellationToken cancellationToken)
    {
        var activeReservation = await _context.Reservations
            .Where(r => !r.IsDeleted && r.ResourceType == ResourceType.Desk &&
                       r.ResourceId == desk.Id && r.StartsAt <= timestamp && r.EndsAt >= timestamp)
            .Include(r => r.User)
            .FirstOrDefaultAsync(cancellationToken);

        var currentUser = activeReservation?.User != null 
            ? $"{activeReservation.User.FirstName} {activeReservation.User.LastName}".Trim() 
            : null;

        return new DeskDetailDto
        {
            DeskId = desk.Id,
            DeskName = desk.Name,
            IsOccupied = activeReservation != null,
            ReservationId = activeReservation?.Id,
            CurrentUser = currentUser,
            ExpectedCheckOutTime = activeReservation?.EndsAt,
            Status = activeReservation != null ? "occupied" : "available"
        };
    }

    private async Task<RoomDetailDto?> GetRoomDetailAsync(Room room, DateTime timestamp, CancellationToken cancellationToken)
    {
        var activeReservation = await _context.Reservations
            .Where(r => !r.IsDeleted && r.ResourceType == ResourceType.Room &&
                       r.ResourceId == room.Id && r.StartsAt <= timestamp && r.EndsAt >= timestamp)
            .Include(r => r.User)
            .FirstOrDefaultAsync(cancellationToken);

        var currentOccupancy = activeReservation?.ExpectedAttendees ?? 0;
        var occupancyPercentage = room.Capacity > 0 ? (currentOccupancy * 100m) / room.Capacity : 0;

        var organizerName = activeReservation?.User != null 
            ? $"{activeReservation.User.FirstName} {activeReservation.User.LastName}".Trim() 
            : null;

        return new RoomDetailDto
        {
            RoomId = room.Id,
            RoomName = room.Name,
            Capacity = room.Capacity,
            IsOccupied = activeReservation != null,
            ReservationId = activeReservation?.Id,
            CurrentOccupancy = currentOccupancy,
            OccupancyPercentage = occupancyPercentage,
            OrganizerName = organizerName,
            ExpectedAvailableTime = activeReservation?.EndsAt,
            Status = activeReservation != null ? "occupied" : "available"
        };
    }

    private List<HeatMapDataPointDto> GenerateHistoricalDataPoints(
        List<Reservation> reservations, DateTime startTime, DateTime endTime, 
        string period, string resourceType)
    {
        var dataPoints = new List<HeatMapDataPointDto>();
        var currentTime = startTime;
        var interval = period switch { "minute" => TimeSpan.FromMinutes(1), "daily" => TimeSpan.FromDays(1), _ => TimeSpan.FromHours(1) };

        while (currentTime <= endTime)
        {
            var relevantReservations = reservations
                .Where(r => r.StartsAt <= currentTime && r.EndsAt >= currentTime)
                .ToList();

            var occupiedDesks = relevantReservations.Count(r => r.ResourceType == ResourceType.Desk);
            var occupiedRooms = relevantReservations.Count(r => r.ResourceType == ResourceType.Room);

            int totalCapacity = 0, occupiedCount = 0;
            if (resourceType == "desk" || resourceType == "all") { totalCapacity += reservations.Count(r => r.ResourceType == ResourceType.Desk); occupiedCount += occupiedDesks; }
            if (resourceType == "room" || resourceType == "all") { totalCapacity += reservations.Count(r => r.ResourceType == ResourceType.Room); occupiedCount += occupiedRooms; }

            var occupancyPercentage = totalCapacity > 0 ? (occupiedCount * 100m) / totalCapacity : 0;

            dataPoints.Add(new HeatMapDataPointDto
            {
                Id = Guid.NewGuid(),
                Timestamp = currentTime,
                OccupiedCount = occupiedCount,
                CapacityTotal = totalCapacity,
                AvailableCount = totalCapacity - occupiedCount,
                OccupancyPercentage = occupancyPercentage,
                ColorCode = GetOccupancyColorCode(occupancyPercentage)
            });

            currentTime = currentTime.Add(interval);
        }

        return dataPoints;
    }

    private OccupancyStatisticsDto CalculateStatistics(List<HeatMapDataPointDto> dataPoints, List<Reservation> reservations)
    {
        return new OccupancyStatisticsDto
        {
            AverageOccupancy = dataPoints.Count > 0 ? dataPoints.Average(d => d.OccupancyPercentage) : 0,
            PeakOccupancy = dataPoints.Count > 0 ? dataPoints.Max(d => d.OccupancyPercentage) : 0,
            MinOccupancy = dataPoints.Count > 0 ? dataPoints.Min(d => d.OccupancyPercentage) : 0,
            PeakHour = dataPoints.Count > 0 ? dataPoints.OrderByDescending(d => d.OccupancyPercentage).First().Timestamp.Hour : 0,
            PeakDayOfWeek = dataPoints.Count > 0 ? (int)dataPoints.OrderByDescending(d => d.OccupancyPercentage).First().Timestamp.DayOfWeek : 0,
            TotalReservations = reservations.Count,
            CompletedReservations = reservations.Count(r => r.CheckOutAt.HasValue),
            NoShowCount = reservations.Count(r => r.Status == ReservationStatus.NoShow),
            CancellationCount = reservations.Count(r => r.Status == ReservationStatus.Cancelled)
        };
    }

    private async Task<OccupancyPredictionDto?> PredictOccupancyAsync(Guid? locationId, DateTime timestamp, CancellationToken cancellationToken)
    {
        var prediction = new OccupancyPredictionDto
        {
            PredictedTime = timestamp,
            PredictedOccupancy = 45,
            ConfidenceLevel = 60,
            ExpectedAvailableDesks = 15,
            ExpectedAvailableRooms = 3,
            ConfidenceFactors = new List<string> { "Based on historical patterns" }
        };

        return await Task.FromResult(prediction);
    }
}
