using OfisYonetimSistemi.Application.DTOs;
using OfisYonetimSistemi.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace OfisYonetimSistemi.API.Controllers;

/// <summary>
/// HeatMap endpoints for occupancy visualization and analytics
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HeatMapController : ControllerBase
{
    private readonly IHeatMapService _heatMapService;
    private readonly ILogger<HeatMapController> _logger;

    public HeatMapController(IHeatMapService heatMapService, ILogger<HeatMapController> logger)
    {
        _heatMapService = heatMapService ?? throw new ArgumentNullException(nameof(heatMapService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Get current occupancy for a location in real-time
    /// </summary>
    /// <param name="locationId">Location ID (required)</param>
    /// <param name="floorId">Optional floor filter</param>
    /// <param name="resourceType">Resource type: desk, room, or all (default: all)</param>
    /// <returns>Current occupancy data with color coding</returns>
    [HttpGet("current")]
    [ProducesResponseType(typeof(CurrentHeatMapResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<CurrentHeatMapResponseDto>> GetCurrent(
        [FromQuery] Guid locationId,
        [FromQuery] Guid? floorId = null,
        [FromQuery] string resourceType = "all",
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (locationId == Guid.Empty)
                return BadRequest("Location ID is required");

            var query = new HeatMapQueryDto
            {
                LocationId = locationId,
                FloorId = floorId,
                ResourceType = resourceType,
                StartTime = DateTime.UtcNow,
                Period = "hourly"
            };

            var result = await _heatMapService.GetCurrentOccupancyAsync(query, cancellationToken);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for current occupancy");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving current occupancy");
            return StatusCode(500, "Error retrieving occupancy data");
        }
    }

    /// <summary>
    /// Get historical occupancy data for analysis
    /// </summary>
    /// <param name="locationId">Location ID (required)</param>
    /// <param name="startDate">Start date (default: 7 days ago)</param>
    /// <param name="endDate">End date (default: now)</param>
    /// <param name="period">Aggregation period: minute, hourly, or daily (default: hourly)</param>
    /// <returns>Historical occupancy data with statistics</returns>
    [HttpGet("history")]
    [ProducesResponseType(typeof(HistoricalHeatMapResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<HistoricalHeatMapResponseDto>> GetHistory(
        [FromQuery] Guid locationId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string period = "hourly",
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (locationId == Guid.Empty)
                return BadRequest("Location ID is required");

            var query = new HeatMapQueryDto
            {
                LocationId = locationId,
                StartTime = startDate,
                EndTime = endDate,
                Period = period,
                ResourceType = "all"
            };

            var result = await _heatMapService.GetHistoricalOccupancyAsync(query, cancellationToken);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for historical occupancy");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving historical occupancy");
            return StatusCode(500, "Error retrieving historical data");
        }
    }

    /// <summary>
    /// Get detailed occupancy for a specific zone
    /// </summary>
    /// <param name="zoneId">Zone ID</param>
    /// <param name="timestamp">Optional timestamp (default: now)</param>
    /// <returns>Detailed zone occupancy with desk/room breakdown</returns>
    [HttpGet("zones/{zoneId}")]
    [ProducesResponseType(typeof(ZoneDetailedOccupancyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ZoneDetailedOccupancyDto>> GetZoneDetails(
        [FromRoute] Guid zoneId,
        [FromQuery] DateTime? timestamp = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (zoneId == Guid.Empty)
                return BadRequest("Zone ID is required");

            var result = await _heatMapService.GetZoneDetailedOccupancyAsync(zoneId, timestamp, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Zone not found: {ZoneId}", zoneId);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving zone details");
            return StatusCode(500, "Error retrieving zone data");
        }
    }

    /// <summary>
    /// Get occupancy predictions for future time period
    /// </summary>
    /// <param name="locationId">Location ID (required)</param>
    /// <param name="startDate">Start time for predictions</param>
    /// <param name="endDate">End time for predictions</param>
    /// <returns>Predicted occupancy with confidence levels</returns>
    [HttpGet("predictions")]
    [ProducesResponseType(typeof(List<OccupancyPredictionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<OccupancyPredictionDto>>> GetPredictions(
        [FromQuery] Guid locationId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (locationId == Guid.Empty)
                return BadRequest("Location ID is required");

            var query = new HeatMapQueryDto
            {
                LocationId = locationId,
                StartTime = startDate,
                EndTime = endDate,
                Period = "hourly",
                ResourceType = "all"
            };

            var result = await _heatMapService.GetOccupancyPredictionsAsync(query, cancellationToken);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for predictions");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving predictions");
            return StatusCode(500, "Error retrieving prediction data");
        }
    }

    /// <summary>
    /// Get heatmap visualization configuration
    /// </summary>
    /// <returns>Frontend configuration including colors, thresholds, and options</returns>
    [HttpGet("config")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(HeatMapConfigDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<HeatMapConfigDto>> GetConfiguration(CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _heatMapService.GetConfigurationAsync(cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving configuration");
            return StatusCode(500, "Error retrieving configuration");
        }
    }

    /// <summary>
    /// Invalidate heatmap cache for a location
    /// </summary>
    /// <param name="locationId">Location ID</param>
    /// <remarks>Admin endpoint - clears cached occupancy data</remarks>
    [HttpPost("{locationId}/invalidate-cache")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> InvalidateCache(
        [FromRoute] Guid locationId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (locationId == Guid.Empty)
                return BadRequest("Location ID is required");

            await _heatMapService.InvalidateCacheAsync(locationId, cancellationToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invalidating cache for location {LocationId}", locationId);
            return StatusCode(500, "Error invalidating cache");
        }
    }
}
