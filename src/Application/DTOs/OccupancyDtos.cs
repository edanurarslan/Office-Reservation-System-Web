namespace OfisYonetimSistemi.Application.DTOs;

/// <summary>
/// DTO for occupancy query parameters
/// </summary>
public class OccupancyQueryDto
{
    public Guid LocationId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Days { get; set; } = 7; // Default: last 7 days
}

/// <summary>
/// DTO for current occupancy response
/// </summary>
public class CurrentOccupancyDto
{
    public Guid LocationId { get; set; }
    public int TotalDesks { get; set; }
    public int OccupiedDesks { get; set; }
    public int AvailableDesks { get; set; }
    public decimal DeskOccupancyPercentage { get; set; }
    
    public int TotalRooms { get; set; }
    public int OccupiedRooms { get; set; }
    public int AvailableRooms { get; set; }
    public decimal RoomOccupancyPercentage { get; set; }
    
    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// DTO for available resources
/// </summary>
public class AvailableResourceDto
{
    public Guid ResourceId { get; set; }
    public string ResourceType { get; set; } = string.Empty; // "desk" or "room"
    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }
    public int? Capacity { get; set; }
    public string Status { get; set; } = "available";
}

/// <summary>
/// DTO for heatmap data point
/// </summary>
public class HeatmapDataPointDto
{
    public int Hour { get; set; }
    public decimal OccupancyPercentage { get; set; }
    public int OccupiedCount { get; set; }
    public int TotalCount { get; set; }
}

/// <summary>
/// DTO for duration statistics
/// </summary>
public class DurationStatisticsDto
{
    public double AverageDurationMinutes { get; set; }
    public double MinDurationMinutes { get; set; }
    public double MaxDurationMinutes { get; set; }
    public int TotalCompletedReservations { get; set; }
    public int DaysAnalyzed { get; set; }
}
