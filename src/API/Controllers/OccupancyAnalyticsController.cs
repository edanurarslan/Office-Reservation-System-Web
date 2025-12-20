using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfisYonetimSistemi.Infrastructure.Services;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/locations/{locationId}/occupancy")]
[Authorize]
public class OccupancyAnalyticsController : ControllerBase
{
    private readonly IOccupancyAnalyticsService _occupancyAnalyticsService;

    public OccupancyAnalyticsController(IOccupancyAnalyticsService occupancyAnalyticsService)
    {
        _occupancyAnalyticsService = occupancyAnalyticsService;
    }

    /// <summary>
    /// Get current occupancy status for a location
    /// </summary>
    /// <param name="locationId">Location ID</param>
    /// <param name="timeStamp">Optional point in time to check occupancy (default: current time)</param>
    /// <returns>Current occupancy data with percentages and counts</returns>
    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentOccupancy([FromRoute] Guid locationId, [FromQuery] DateTime? timeStamp = null)
    {
        try
        {
            var data = await _occupancyAnalyticsService.GetCurrentOccupancyAsync(locationId, timeStamp);
            return Ok(data);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = new { code = "OCCUPANCY_ERROR", message = ex.Message } });
        }
    }

    /// <summary>
    /// Get available desks and rooms for a time slot
    /// </summary>
    /// <param name="locationId">Location ID</param>
    /// <param name="startsAt">Reservation start time (ISO 8601)</param>
    /// <param name="endsAt">Reservation end time (ISO 8601)</param>
    /// <returns>List of available desks and rooms for the time period</returns>
    [HttpGet("available")]
    public async Task<IActionResult> GetAvailableResources(
        [FromRoute] Guid locationId,
        [FromQuery] string startsAt,
        [FromQuery] string endsAt)
    {
        try
        {
            if (!DateTime.TryParse(startsAt, out var start) || !DateTime.TryParse(endsAt, out var end))
            {
                return BadRequest(new { error = new { code = "INVALID_DATETIME", message = "Invalid date/time format" } });
            }

            if (start >= end)
            {
                return BadRequest(new { error = new { code = "INVALID_TIME_RANGE", message = "Start time must be before end time" } });
            }

            var data = await _occupancyAnalyticsService.GetAvailableResourcesAsync(locationId, start, end);
            return Ok(data);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = new { code = "AVAILABILITY_ERROR", message = ex.Message } });
        }
    }

    /// <summary>
    /// Get occupancy heatmap data for visualization
    /// </summary>
    /// <param name="locationId">Location ID</param>
    /// <param name="from">Start date for heatmap (ISO 8601)</param>
    /// <param name="to">End date for heatmap (ISO 8601)</param>
    /// <returns>Heatmap entries with occupancy data for each time period</returns>
    [HttpGet("heatmap")]
    public async Task<IActionResult> GetHeatmap(
        [FromRoute] Guid locationId,
        [FromQuery] string from,
        [FromQuery] string to)
    {
        try
        {
            if (!DateTime.TryParse(from, out var fromDate) || !DateTime.TryParse(to, out var toDate))
            {
                return BadRequest(new { error = new { code = "INVALID_DATETIME", message = "Invalid date/time format" } });
            }

            if (fromDate >= toDate)
            {
                return BadRequest(new { error = new { code = "INVALID_DATE_RANGE", message = "From date must be before to date" } });
            }

            // Limit to 90 days maximum to avoid excessive data processing
            if ((toDate - fromDate).TotalDays > 90)
            {
                return BadRequest(new { error = new { code = "DATE_RANGE_TOO_LARGE", message = "Maximum date range is 90 days" } });
            }

            var data = await _occupancyAnalyticsService.GetHeatmapAsync(locationId, fromDate, toDate);
            return Ok(data);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = new { code = "HEATMAP_ERROR", message = ex.Message } });
        }
    }

    /// <summary>
    /// Get average desk/room usage duration statistics
    /// </summary>
    /// <param name="locationId">Location ID</param>
    /// <param name="days">Number of days to look back for statistics (default: 30, max: 365)</param>
    /// <returns>Average, minimum, and maximum duration statistics</returns>
    [HttpGet("analytics/duration")]
    public async Task<IActionResult> GetAverageDuration(
        [FromRoute] Guid locationId,
        [FromQuery] int days = 30)
    {
        try
        {
            // Validate days parameter
            if (days < 1 || days > 365)
            {
                return BadRequest(new { error = new { code = "INVALID_DAYS", message = "Days parameter must be between 1 and 365" } });
            }

            var data = await _occupancyAnalyticsService.GetAverageDurationAsync(locationId, days);
            return Ok(data);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = new { code = "DURATION_ANALYTICS_ERROR", message = ex.Message } });
        }
    }
}
