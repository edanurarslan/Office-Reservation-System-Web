using OfisYonetimSistemi.Application.DTOs;

namespace OfisYonetimSistemi.Application.Services;

/// <summary>
/// Service for generating and managing occupancy heatmap data
/// </summary>
public interface IHeatMapService
{
    /// <summary>
    /// Get current occupancy data for a location
    /// </summary>
    Task<CurrentHeatMapResponseDto> GetCurrentOccupancyAsync(HeatMapQueryDto query, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get historical occupancy data
    /// </summary>
    Task<HistoricalHeatMapResponseDto> GetHistoricalOccupancyAsync(HeatMapQueryDto query, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get detailed occupancy information for a specific zone
    /// </summary>
    Task<ZoneDetailedOccupancyDto> GetZoneDetailedOccupancyAsync(Guid zoneId, DateTime? timestamp = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get occupancy predictions for future time period
    /// </summary>
    Task<List<OccupancyPredictionDto>> GetOccupancyPredictionsAsync(HeatMapQueryDto query, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get configuration for heatmap visualization
    /// </summary>
    Task<HeatMapConfigDto> GetConfigurationAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculate occupancy percentage with color coding
    /// </summary>
    string GetOccupancyColorCode(decimal occupancyPercentage);

    /// <summary>
    /// Get trend indicator based on historical data
    /// </summary>
    Task<string> GetTrendIndicatorAsync(Guid locationId, Guid? floorId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidate heatmap cache for location
    /// </summary>
    Task InvalidateCacheAsync(Guid locationId, CancellationToken cancellationToken = default);
}
