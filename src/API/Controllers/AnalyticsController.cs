using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/analytics")]
public class AnalyticsController : ControllerBase
{
    // GET /analytics/attendance?date=2025-10-03&locationId=
    [HttpGet("attendance")]
    [Authorize]
    public IActionResult GetAttendance([FromQuery] string date, [FromQuery] string? locationId)
    {
        var attendance = new[] {
            new { userId = "u1", name = "Ofis Kullanıcı", checkedIn = true },
            new { userId = "u2", name = "Yönetici", checkedIn = false }
        };
        return Ok(attendance);
    }

    // GET /analytics/utilization?from=&to=&granularity=daily|weekly
    [HttpGet("utilization")]
    [Authorize]
    public IActionResult GetUtilization([FromQuery] string from, [FromQuery] string to, [FromQuery] string granularity)
    {
        var utilization = new[] {
            new { date = from, occupancyRate = 0.75 },
            new { date = to, occupancyRate = 0.60 }
        };
        return Ok(utilization);
    }

    // GET /analytics/heatmap?locationId=&date=
    [HttpGet("heatmap")]
    [Authorize]
    public IActionResult GetHeatmap([FromQuery] string locationId, [FromQuery] string date)
    {
        var heatmap = new[] {
            new { deskId = "d1", occupied = true },
            new { deskId = "d2", occupied = false }
        };
        return Ok(heatmap);
    }
}
