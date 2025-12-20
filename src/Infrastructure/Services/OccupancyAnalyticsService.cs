using OfisYonetimSistemi.Domain.Entities;
using OfisYonetimSistemi.Domain.Enums;
using OfisYonetimSistemi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace OfisYonetimSistemi.Infrastructure.Services;

/// <summary>
/// Service for calculating occupancy analytics and real-time desk/room availability
/// </summary>
public interface IOccupancyAnalyticsService
{
    /// <summary>
    /// Get current occupancy for a location (floor/zone)
    /// </summary>
    /// <param name="locationId">Location ID</param>
    /// <param name="timeStamp">Point in time to check occupancy (default: now)</param>
    /// <returns>Occupancy data</returns>
    Task<OccupancyData> GetCurrentOccupancyAsync(Guid locationId, DateTime? timeStamp = null);

    /// <summary>
    /// Get available desks/rooms for a location at specific time
    /// </summary>
    /// <param name="locationId">Location ID</param>
    /// <param name="startsAt">Reservation start time</param>
    /// <param name="endsAt">Reservation end time</param>
    /// <returns>List of available resources</returns>
    Task<AvailableResourcesData> GetAvailableResourcesAsync(Guid locationId, DateTime startsAt, DateTime endsAt);

    /// <summary>
    /// Get heatmap data (occupancy by hour/floor/zone)
    /// </summary>
    /// <param name="locationId">Location ID</param>
    /// <param name="fromDate">Start date for heatmap</param>
    /// <param name="toDate">End date for heatmap</param>
    /// <returns>Heatmap data for visualization</returns>
    Task<HeatmapData> GetHeatmapAsync(Guid locationId, DateTime fromDate, DateTime toDate);

    /// <summary>
    /// Get average desk/room usage duration
    /// </summary>
    /// <param name="locationId">Location ID</param>
    /// <param name="days">Number of days to look back (default: 30)</param>
    /// <returns>Average duration in minutes</returns>
    Task<AverageDurationData> GetAverageDurationAsync(Guid locationId, int days = 30);
}

/// <summary>
/// Current occupancy snapshot
/// </summary>
public class OccupancyData
{
    public Guid LocationId { get; set; }
    public int TotalDesks { get; set; }
    public int OccupiedDesks { get; set; }
    public int AvailableDesks { get; set; }
    public decimal OccupancyPercentage { get; set; } // 0-100
    public int TotalRooms { get; set; }
    public int OccupiedRooms { get; set; }
    public int AvailableRooms { get; set; }
    public DateTime SnapshotTime { get; set; }
}

/// <summary>
/// Available resources for a time slot
/// </summary>
public class AvailableResourcesData
{
    public List<AvailableDesk> AvailableDesks { get; set; } = [];
    public List<AvailableRoom> AvailableRooms { get; set; } = [];
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}

public class AvailableDesk
{
    public Guid Id { get; set; }
    public string DeskNumber { get; set; } = string.Empty;
    public Guid FloorId { get; set; }
    public Guid ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public bool HasWindow { get; set; }
    public bool HasMonitor { get; set; }
}

public class AvailableRoom
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public Guid FloorId { get; set; }
    public string Features { get; set; } = string.Empty; // Projector, Whiteboard, etc.
}

/// <summary>
/// Heatmap data for occupancy visualization
/// </summary>
public class HeatmapData
{
    public List<HeatmapEntry> Entries { get; set; } = [];
    public string Unit { get; set; } = "hour"; // hour, day, week
    public int MaxOccupancy { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
}

public class HeatmapEntry
{
    public string Label { get; set; } = string.Empty; // e.g., "Mon 09:00", "Floor 2 - Zone A"
    public int Occupancy { get; set; }
    public decimal Percentage { get; set; }
    public string FloorOrZone { get; set; } = string.Empty;
}

/// <summary>
/// Average usage duration
/// </summary>
public class AverageDurationData
{
    public Guid LocationId { get; set; }
    public int AverageDurationMinutes { get; set; }
    public int MinDurationMinutes { get; set; }
    public int MaxDurationMinutes { get; set; }
    public int SamplesCount { get; set; }
    public DateTime CalculatedAt { get; set; }
}

public class OccupancyAnalyticsService : IOccupancyAnalyticsService
{
    private readonly ApplicationDbContext _context;

    public OccupancyAnalyticsService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OccupancyData> GetCurrentOccupancyAsync(Guid locationId, DateTime? timeStamp = null)
    {
        var now = timeStamp ?? DateTime.UtcNow;

        // Get total desks in location
        var totalDesks = await _context.Desks
            .Where(d => d.Zone.Floor.LocationId == locationId)
            .CountAsync();

        // Get occupied desks at this moment
        var occupiedDesks = await _context.Reservations
            .Where(r =>
                r.Status == ReservationStatus.CheckedIn &&
                r.ResourceType == ResourceType.Desk &&
                r.StartsAt <= now &&
                r.EndsAt > now)
            .Select(r => r.ResourceId)
            .Distinct()
            .CountAsync();

        // Get total rooms in location
        var totalRooms = await _context.Rooms
            .Where(r => r.LocationId == locationId)
            .CountAsync();

        // Get occupied rooms at this moment
        var occupiedRooms = await _context.Reservations
            .Where(r =>
                r.Status == ReservationStatus.CheckedIn &&
                r.ResourceType == ResourceType.Room &&
                r.StartsAt <= now &&
                r.EndsAt > now)
            .Select(r => r.ResourceId)
            .Distinct()
            .CountAsync();

        var availableDesks = totalDesks - occupiedDesks;
        var availableRooms = totalRooms - occupiedRooms;
        var totalOccupancy = totalDesks > 0 
            ? (occupiedDesks / (decimal)totalDesks) * 100 
            : 0;

        return new OccupancyData
        {
            LocationId = locationId,
            TotalDesks = totalDesks,
            OccupiedDesks = occupiedDesks,
            AvailableDesks = availableDesks,
            OccupancyPercentage = Math.Round(totalOccupancy, 2),
            TotalRooms = totalRooms,
            OccupiedRooms = occupiedRooms,
            AvailableRooms = availableRooms,
            SnapshotTime = now
        };
    }

    public async Task<AvailableResourcesData> GetAvailableResourcesAsync(Guid locationId, DateTime startsAt, DateTime endsAt)
    {
        // Get all desks in location
        var allDesks = await _context.Desks
            .Where(d => d.Zone.Floor.LocationId == locationId)
            .Include(d => d.Zone)
            .ToListAsync();

        // Get reserved desks during this time period
        var reservedDeskIds = await _context.Reservations
            .Where(r =>
                r.ResourceType == ResourceType.Desk &&
                r.Status != ReservationStatus.Cancelled &&
                r.Status != ReservationStatus.NoShow &&
                r.StartsAt < endsAt &&
                r.EndsAt > startsAt)
            .Select(r => r.ResourceId)
            .ToListAsync();

        var availableDesks = allDesks
            .Where(d => !reservedDeskIds.Contains(d.Id))
            .Select(d => new AvailableDesk
            {
                Id = d.Id,
                DeskNumber = d.Name,
                FloorId = d.Zone.FloorId,
                ZoneId = d.ZoneId,
                ZoneName = d.Zone?.Name ?? string.Empty,
                HasWindow = false, // Not available in entity
                HasMonitor = d.HasMonitor
            })
            .ToList();

        // Get all rooms in location
        var allRooms = await _context.Rooms
            .Where(r => r.LocationId == locationId)
            .ToListAsync();

        // Get reserved rooms during this time period
        var reservedRoomIds = await _context.Reservations
            .Where(r =>
                r.ResourceType == ResourceType.Room &&
                r.Status != ReservationStatus.Cancelled &&
                r.Status != ReservationStatus.NoShow &&
                r.StartsAt < endsAt &&
                r.EndsAt > startsAt)
            .Select(r => r.ResourceId)
            .ToListAsync();

        var availableRooms = allRooms
            .Where(r => !reservedRoomIds.Contains(r.Id))
            .Select(r => new AvailableRoom
            {
                Id = r.Id,
                Name = r.Name,
                Capacity = r.Capacity,
                FloorId = r.LocationId, // Room is directly in Location
                Features = r.Equipment ?? string.Empty
            })
            .ToList();

        return new AvailableResourcesData
        {
            AvailableDesks = availableDesks,
            AvailableRooms = availableRooms,
            StartTime = startsAt,
            EndTime = endsAt
        };
    }

    public async Task<HeatmapData> GetHeatmapAsync(Guid locationId, DateTime fromDate, DateTime toDate)
    {
        // Get desk IDs in this location
        var deskIdsInLocation = await _context.Desks
            .Where(d => d.Zone.Floor.LocationId == locationId)
            .Select(d => d.Id)
            .ToListAsync();

        // Get room IDs in this location
        var roomIdsInLocation = await _context.Rooms
            .Where(r => r.LocationId == locationId)
            .Select(r => r.Id)
            .ToListAsync();

        var reservations = await _context.Reservations
            .Where(r =>
                r.Status == ReservationStatus.Completed &&
                r.CheckInAt.HasValue &&
                r.CheckOutAt.HasValue &&
                r.StartsAt >= fromDate &&
                r.StartsAt <= toDate &&
                ((r.ResourceType == ResourceType.Desk && deskIdsInLocation.Contains(r.ResourceId)) ||
                 (r.ResourceType == ResourceType.Room && roomIdsInLocation.Contains(r.ResourceId))))
            .ToListAsync();

        var entries = new List<HeatmapEntry>();
        var currentDate = new DateTime(fromDate.Year, fromDate.Month, fromDate.Day, 0, 0, 0);

        while (currentDate <= toDate)
        {
            for (int hour = 6; hour <= 18; hour++) // Working hours 6 AM to 6 PM
            {
                var hourStart = new DateTime(currentDate.Year, currentDate.Month, currentDate.Day, hour, 0, 0);
                var hourEnd = hourStart.AddHours(1);

                var occupancyCount = reservations
                    .Count(r =>
                        r.StartsAt < hourEnd &&
                        r.CheckOutAt > hourStart);

                if (occupancyCount > 0)
                {
                    entries.Add(new HeatmapEntry
                    {
                        Label = hourStart.ToString("ddd HH:00"),
                        Occupancy = occupancyCount,
                        Percentage = (decimal)occupancyCount,
                        FloorOrZone = "Location"
                    });
                }
            }

            currentDate = currentDate.AddDays(1);
        }

        var maxOccupancy = entries.Any() ? entries.Max(e => e.Occupancy) : 0;
        if (maxOccupancy > 0)
        {
            foreach (var entry in entries)
            {
                entry.Percentage = (entry.Occupancy / (decimal)maxOccupancy) * 100;
            }
        }

        return new HeatmapData
        {
            Entries = entries,
            Unit = "hour",
            MaxOccupancy = maxOccupancy,
            PeriodStart = fromDate,
            PeriodEnd = toDate
        };
    }

    public async Task<AverageDurationData> GetAverageDurationAsync(Guid locationId, int days = 30)
    {
        var lookbackDate = DateTime.UtcNow.AddDays(-days);

        // Get desk IDs in this location
        var deskIdsInLocation = await _context.Desks
            .Where(d => d.Zone.Floor.LocationId == locationId)
            .Select(d => d.Id)
            .ToListAsync();

        // Get room IDs in this location
        var roomIdsInLocation = await _context.Rooms
            .Where(r => r.LocationId == locationId)
            .Select(r => r.Id)
            .ToListAsync();

        var completedReservations = await _context.Reservations
            .Where(r =>
                r.Status == ReservationStatus.Completed &&
                r.CheckInAt.HasValue &&
                r.CheckOutAt.HasValue &&
                r.CreatedAt >= lookbackDate &&
                ((r.ResourceType == ResourceType.Desk && deskIdsInLocation.Contains(r.ResourceId)) ||
                 (r.ResourceType == ResourceType.Room && roomIdsInLocation.Contains(r.ResourceId))))
            .ToListAsync();

        if (completedReservations.Count == 0)
        {
            return new AverageDurationData
            {
                LocationId = locationId,
                AverageDurationMinutes = 0,
                MinDurationMinutes = 0,
                MaxDurationMinutes = 0,
                SamplesCount = 0,
                CalculatedAt = DateTime.UtcNow
            };
        }

        var durations = completedReservations
            .Where(r => r.CheckInAt.HasValue && r.CheckOutAt.HasValue)
            .Select(r => (int)(r.CheckOutAt!.Value - r.CheckInAt!.Value).TotalMinutes)
            .ToList();

        return new AverageDurationData
        {
            LocationId = locationId,
            AverageDurationMinutes = (int)durations.Average(),
            MinDurationMinutes = durations.Min(),
            MaxDurationMinutes = durations.Max(),
            SamplesCount = durations.Count,
            CalculatedAt = DateTime.UtcNow
        };
    }
}
