using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/logs")]
public class LogsController : ControllerBase
{
    // GET /logs
    [HttpGet]
    [Authorize(Policy = "RequireManagerRole")]
    public async Task<IActionResult> GetLogs([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromQuery] Guid? userId, [FromQuery] string? action, [FromQuery] string? from, [FromQuery] string? to)
    {
        var query = db.AuditLogs.AsQueryable();
        if (userId.HasValue) query = query.Where(l => l.UserId == userId.Value);
        if (!string.IsNullOrEmpty(action)) query = query.Where(l => l.Action == action);
        if (!string.IsNullOrEmpty(from) && DateTime.TryParse(from, out var fromDate)) query = query.Where(l => l.Timestamp >= fromDate);
        if (!string.IsNullOrEmpty(to) && DateTime.TryParse(to, out var toDate)) query = query.Where(l => l.Timestamp <= toDate);
        var logs = await query.Select(l => new { l.Id, l.UserId, l.Action, l.Timestamp, l.AdditionalData }).ToListAsync();
        return Ok(logs);
    }
}
