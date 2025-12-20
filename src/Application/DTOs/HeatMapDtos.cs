namespace OfisYonetimSistemi.Application.DTOs;

/// <summary>
/// DTO for querying heatmap data
/// </summary>
public class HeatMapQueryDto
{
    /// <summary>
    /// Location ID - required for current data
    /// </summary>
    public Guid? LocationId { get; set; }

    /// <summary>
    /// Floor ID - optional for filtering by floor
    /// </summary>
    public Guid? FloorId { get; set; }

    /// <summary>
    /// Zone ID - optional for filtering by zone
    /// </summary>
    public Guid? ZoneId { get; set; }

    /// <summary>
    /// Start time for data range
    /// </summary>
    public DateTime? StartTime { get; set; }

    /// <summary>
    /// End time for data range
    /// </summary>
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// Aggregation period: minute, hourly, daily
    /// </summary>
    public string Period { get; set; } = "hourly";

    /// <summary>
    /// Resource types to include: desk, room, all
    /// </summary>
    public string ResourceType { get; set; } = "all";

    /// <summary>
    /// Department ID - optional for filtering
    /// </summary>
    public Guid? DepartmentId { get; set; }
}

/// <summary>
/// Current occupancy data for a location/floor/zone
/// </summary>
public class HeatMapDataPointDto
{
    /// <summary>
    /// Unique identifier
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Location ID this heatmap point belongs to
    /// </summary>
    public Guid LocationId { get; set; }

    /// <summary>
    /// Location name for display
    /// </summary>
    public string LocationName { get; set; } = string.Empty;

    /// <summary>
    /// Floor ID (null for location-level aggregation)
    /// </summary>
    public Guid? FloorId { get; set; }

    /// <summary>
    /// Floor number (null for location-level aggregation)
    /// </summary>
    public int? FloorNumber { get; set; }

    /// <summary>
    /// Floor name (null for location-level aggregation)
    /// </summary>
    public string? FloorName { get; set; }

    /// <summary>
    /// Zone ID (null for floor-level aggregation)
    /// </summary>
    public Guid? ZoneId { get; set; }

    /// <summary>
    /// Zone name (null for floor-level aggregation)
    /// </summary>
    public string? ZoneName { get; set; }

    /// <summary>
    /// Timestamp of this data point
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Current number of occupied desks/rooms
    /// </summary>
    public int OccupiedCount { get; set; }

    /// <summary>
    /// Total capacity (desks + rooms)
    /// </summary>
    public int CapacityTotal { get; set; }

    /// <summary>
    /// Available resources
    /// </summary>
    public int AvailableCount { get; set; }

    /// <summary>
    /// Occupancy percentage (0-100)
    /// </summary>
    public decimal OccupancyPercentage { get; set; }

    /// <summary>
    /// Color for visualization (based on occupancy)
    /// </summary>
    public string ColorCode { get; set; } = "#00ff00"; // Green by default

    /// <summary>
    /// Desk occupancy breakdown
    /// </summary>
    public DeskOccupancyDto? DeskOccupancy { get; set; }

    /// <summary>
    /// Room occupancy breakdown
    /// </summary>
    public RoomOccupancyDto? RoomOccupancy { get; set; }

    /// <summary>
    /// Trend indicator (up, down, stable)
    /// </summary>
    public string Trend { get; set; } = "stable";

    /// <summary>
    /// Time until peak hours
    /// </summary>
    public int? MinutesUntilPeak { get; set; }
}

/// <summary>
/// Desk-specific occupancy information
/// </summary>
public class DeskOccupancyDto
{
    /// <summary>
    /// Total desks in this zone
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Currently occupied desks
    /// </summary>
    public int OccupiedCount { get; set; }

    /// <summary>
    /// Available desks
    /// </summary>
    public int AvailableCount { get; set; }

    /// <summary>
    /// Occupancy percentage
    /// </summary>
    public decimal OccupancyPercentage { get; set; }

    /// <summary>
    /// Desks by status
    /// </summary>
    public DeskStatusBreakdownDto? StatusBreakdown { get; set; }
}

/// <summary>
/// Room-specific occupancy information
/// </summary>
public class RoomOccupancyDto
{
    /// <summary>
    /// Total rooms in this zone
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Currently reserved/occupied rooms
    /// </summary>
    public int OccupiedCount { get; set; }

    /// <summary>
    /// Available rooms
    /// </summary>
    public int AvailableCount { get; set; }

    /// <summary>
    /// Occupancy percentage
    /// </summary>
    public decimal OccupancyPercentage { get; set; }

    /// <summary>
    /// Rooms by status
    /// </summary>
    public RoomStatusBreakdownDto? StatusBreakdown { get; set; }
}

/// <summary>
/// Desk status breakdown
/// </summary>
public class DeskStatusBreakdownDto
{
    /// <summary>
    /// Desks currently in use
    /// </summary>
    public int InUse { get; set; }

    /// <summary>
    /// Desks reserved but not checked in
    /// </summary>
    public int Reserved { get; set; }

    /// <summary>
    /// Desks available for booking
    /// </summary>
    public int Available { get; set; }

    /// <summary>
    /// Desks under maintenance
    /// </summary>
    public int Maintenance { get; set; }
}

/// <summary>
/// Room status breakdown
/// </summary>
public class RoomStatusBreakdownDto
{
    /// <summary>
    /// Rooms currently in use
    /// </summary>
    public int InUse { get; set; }

    /// <summary>
    /// Rooms reserved but not checked in
    /// </summary>
    public int Reserved { get; set; }

    /// <summary>
    /// Rooms available for booking
    /// </summary>
    public int Available { get; set; }

    /// <summary>
    /// Rooms blocked/unavailable
    /// </summary>
    public int Blocked { get; set; }
}

/// <summary>
/// Heatmap response for current occupancy
/// </summary>
public class CurrentHeatMapResponseDto
{
    /// <summary>
    /// Timestamp of data
    /// </summary>
    public DateTime GeneratedAt { get; set; }

    /// <summary>
    /// Location-level heatmap data
    /// </summary>
    public HeatMapDataPointDto? LocationLevel { get; set; }

    /// <summary>
    /// Floor-level heatmap data
    /// </summary>
    public List<HeatMapDataPointDto> FloorLevel { get; set; } = new();

    /// <summary>
    /// Zone-level heatmap data
    /// </summary>
    public List<HeatMapDataPointDto> ZoneLevel { get; set; } = new();
}

/// <summary>
/// Historical heatmap data
/// </summary>
public class HistoricalHeatMapResponseDto
{
    /// <summary>
    /// Location ID
    /// </summary>
    public Guid LocationId { get; set; }

    /// <summary>
    /// Floor ID (if filtered)
    /// </summary>
    public Guid? FloorId { get; set; }

    /// <summary>
    /// Date range requested
    /// </summary>
    public DateRangeDto DateRange { get; set; } = new();

    /// <summary>
    /// Historical data points
    /// </summary>
    public List<HeatMapDataPointDto> DataPoints { get; set; } = new();

    /// <summary>
    /// Aggregated statistics
    /// </summary>
    public OccupancyStatisticsDto? Statistics { get; set; }
}

/// <summary>
/// Date range for queries
/// </summary>
public class DateRangeDto
{
    /// <summary>
    /// Start date (inclusive)
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// End date (inclusive)
    /// </summary>
    public DateTime EndDate { get; set; }
}

/// <summary>
/// Occupancy statistics
/// </summary>
public class OccupancyStatisticsDto
{
    /// <summary>
    /// Average occupancy percentage
    /// </summary>
    public decimal AverageOccupancy { get; set; }

    /// <summary>
    /// Peak occupancy percentage
    /// </summary>
    public decimal PeakOccupancy { get; set; }

    /// <summary>
    /// Minimum occupancy percentage
    /// </summary>
    public decimal MinOccupancy { get; set; }

    /// <summary>
    /// Peak hour (0-23)
    /// </summary>
    public int PeakHour { get; set; }

    /// <summary>
    /// Peak day of week (0=Sunday, 6=Saturday)
    /// </summary>
    public int PeakDayOfWeek { get; set; }

    /// <summary>
    /// Average desk occupancy
    /// </summary>
    public decimal? AverageDeskOccupancy { get; set; }

    /// <summary>
    /// Average room occupancy
    /// </summary>
    public decimal? AverageRoomOccupancy { get; set; }

    /// <summary>
    /// Total reservations in period
    /// </summary>
    public int TotalReservations { get; set; }

    /// <summary>
    /// Completed reservations
    /// </summary>
    public int CompletedReservations { get; set; }

    /// <summary>
    /// No-show count
    /// </summary>
    public int NoShowCount { get; set; }

    /// <summary>
    /// Cancellation count
    /// </summary>
    public int CancellationCount { get; set; }
}

/// <summary>
/// Predicted occupancy for future time
/// </summary>
public class OccupancyPredictionDto
{
    /// <summary>
    /// Predicted timestamp
    /// </summary>
    public DateTime PredictedTime { get; set; }

    /// <summary>
    /// Predicted occupancy percentage
    /// </summary>
    public decimal PredictedOccupancy { get; set; }

    /// <summary>
    /// Confidence level (0-100)
    /// </summary>
    public int ConfidenceLevel { get; set; }

    /// <summary>
    /// Expected desk availability
    /// </summary>
    public int ExpectedAvailableDesks { get; set; }

    /// <summary>
    /// Expected room availability
    /// </summary>
    public int ExpectedAvailableRooms { get; set; }

    /// <summary>
    /// Confidence reasons
    /// </summary>
    public List<string> ConfidenceFactors { get; set; } = new();
}

/// <summary>
/// Heatmap configuration for frontend
/// </summary>
public class HeatMapConfigDto
{
    /// <summary>
    /// Minimum occupancy percentage to show data
    /// </summary>
    public int MinOccupancyThreshold { get; set; } = 10;

    /// <summary>
    /// Maximum occupancy percentage
    /// </summary>
    public int MaxOccupancyThreshold { get; set; } = 100;

    /// <summary>
    /// Update frequency in seconds
    /// </summary>
    public int UpdateFrequencySeconds { get; set; } = 30;

    /// <summary>
    /// Enable real-time updates via WebSocket
    /// </summary>
    public bool EnableRealTime { get; set; } = true;

    /// <summary>
    /// Color scheme: heatmap, gradient, traffic_light
    /// </summary>
    public string ColorScheme { get; set; } = "heatmap";

    /// <summary>
    /// Show desk-level details
    /// </summary>
    public bool ShowDeskDetails { get; set; } = true;

    /// <summary>
    /// Show room-level details
    /// </summary>
    public bool ShowRoomDetails { get; set; } = true;

    /// <summary>
    /// Enable trend analysis
    /// </summary>
    public bool EnableTrendAnalysis { get; set; } = true;

    /// <summary>
    /// Enable occupancy predictions
    /// </summary>
    public bool EnablePredictions { get; set; } = true;
}

/// <summary>
/// Zone-level detailed occupancy
/// </summary>
public class ZoneDetailedOccupancyDto
{
    /// <summary>
    /// Zone ID
    /// </summary>
    public Guid ZoneId { get; set; }

    /// <summary>
    /// Zone name
    /// </summary>
    public string ZoneName { get; set; } = string.Empty;

    /// <summary>
    /// Zone description
    /// </summary>
    public string? ZoneDescription { get; set; }

    /// <summary>
    /// Current timestamp
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Individual desk occupancy list
    /// </summary>
    public List<DeskDetailDto> DeskDetails { get; set; } = new();

    /// <summary>
    /// Individual room occupancy list
    /// </summary>
    public List<RoomDetailDto> RoomDetails { get; set; } = new();

    /// <summary>
    /// Overall statistics for zone
    /// </summary>
    public HeatMapDataPointDto? Statistics { get; set; }
}

/// <summary>
/// Individual desk occupancy detail
/// </summary>
public class DeskDetailDto
{
    /// <summary>
    /// Desk ID
    /// </summary>
    public Guid DeskId { get; set; }

    /// <summary>
    /// Desk name/number
    /// </summary>
    public string DeskName { get; set; } = string.Empty;

    /// <summary>
    /// Is desk occupied
    /// </summary>
    public bool IsOccupied { get; set; }

    /// <summary>
    /// Current reservation ID (if occupied)
    /// </summary>
    public Guid? ReservationId { get; set; }

    /// <summary>
    /// User occupying desk (if available)
    /// </summary>
    public string? CurrentUser { get; set; }

    /// <summary>
    /// When user is expected to leave
    /// </summary>
    public DateTime? ExpectedCheckOutTime { get; set; }

    /// <summary>
    /// Desk coordinates (X, Y)
    /// </summary>
    public (int X, int Y)? Coordinates { get; set; }

    /// <summary>
    /// Desk status: available, occupied, reserved, maintenance
    /// </summary>
    public string Status { get; set; } = "available";
}

/// <summary>
/// Individual room occupancy detail
/// </summary>
public class RoomDetailDto
{
    /// <summary>
    /// Room ID
    /// </summary>
    public Guid RoomId { get; set; }

    /// <summary>
    /// Room name
    /// </summary>
    public string RoomName { get; set; } = string.Empty;

    /// <summary>
    /// Room capacity
    /// </summary>
    public int Capacity { get; set; }

    /// <summary>
    /// Is room occupied/reserved
    /// </summary>
    public bool IsOccupied { get; set; }

    /// <summary>
    /// Current reservation ID (if occupied)
    /// </summary>
    public Guid? ReservationId { get; set; }

    /// <summary>
    /// Current occupancy count
    /// </summary>
    public int CurrentOccupancy { get; set; }

    /// <summary>
    /// Occupancy percentage
    /// </summary>
    public decimal OccupancyPercentage { get; set; }

    /// <summary>
    /// Meeting organizer name
    /// </summary>
    public string? OrganizerName { get; set; }

    /// <summary>
    /// When room is expected to be available
    /// </summary>
    public DateTime? ExpectedAvailableTime { get; set; }

    /// <summary>
    /// Room status
    /// </summary>
    public string Status { get; set; } = "available";

    /// <summary>
    /// Equipment in room
    /// </summary>
    public List<string> Equipment { get; set; } = new();
}
