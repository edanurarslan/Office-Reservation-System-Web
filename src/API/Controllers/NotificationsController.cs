using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/notifications")]
public class NotificationsController : ControllerBase
{
    // POST /notifications/bulk
    [HttpPost("bulk")]
    [Authorize(Policy = "RequireManagerRole")]
    public async Task<IActionResult> SendBulkNotification([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromBody] BulkNotificationRequest request)
    {
        int count = 0;
        foreach (var userId in request.UserIds)
        {
            var notification = new OfisYonetimSistemi.Domain.Entities.AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = Guid.Parse(userId),
                Action = "notification",
                AdditionalData = request.Message,
                Timestamp = DateTime.UtcNow
            };
            db.AuditLogs.Add(notification);
            count++;
        }
        await db.SaveChangesAsync();
        return Ok(new { status = "sent", count });
    }
}

public class BulkNotificationRequest
{
    [Required]
    public List<string> UserIds { get; set; } = new();
    [Required]
    public string Message { get; set; } = default!;
}
