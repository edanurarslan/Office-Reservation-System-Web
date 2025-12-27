using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfisYonetimSistemi.Infrastructure.Data;
using OfisYonetimSistemi.Domain.Entities;
using OfisYonetimSistemi.Infrastructure.Services;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<NotificationsController> _logger;
    private readonly IAuditLogService _auditLogService;

    public NotificationsController(ApplicationDbContext context, ILogger<NotificationsController> logger, IAuditLogService auditLogService)
    {
        _context = context;
        _logger = logger;
        _auditLogService = auditLogService;
    }

    /// <summary>
    /// Get all notifications for the current user
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMyNotifications([FromQuery] bool unreadOnly = false)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var query = _context.Notifications
            .Include(n => n.Sender)
            .Where(n => n.UserId == userId.Value)
            .AsNoTracking();

        if (unreadOnly)
        {
            query = query.Where(n => !n.IsRead);
        }

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                n.Id,
                n.Title,
                n.Message,
                n.Type,
                n.IsRead,
                n.ReadAt,
                n.CreatedAt,
                SenderName = n.Sender != null ? n.Sender.FirstName + " " + n.Sender.LastName : null,
                n.RelatedEntityType,
                n.RelatedEntityId
            })
            .ToListAsync();

        return Ok(notifications);
    }

    /// <summary>
    /// Get unread notification count for the current user
    /// </summary>
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var count = await _context.Notifications
            .Where(n => n.UserId == userId.Value && !n.IsRead)
            .CountAsync();

        return Ok(new { count });
    }

    /// <summary>
    /// Mark a notification as read
    /// </summary>
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId.Value);

        if (notification == null)
            return NotFound("Notification not found");

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Notification marked as read" });
    }

    /// <summary>
    /// Mark all notifications as read for the current user
    /// </summary>
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId.Value && !n.IsRead)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "All notifications marked as read", count = notifications.Count });
    }

    /// <summary>
    /// Delete a notification
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId.Value);

        if (notification == null)
            return NotFound("Notification not found");

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Send bulk notification to multiple users (Admin/Manager only)
    /// </summary>
    [HttpPost("bulk")]
    [Authorize(Policy = "RequireManagerRole")]
    public async Task<IActionResult> SendBulkNotification([FromBody] BulkNotificationRequest request)
    {
        var senderId = GetCurrentUserId();
        if (senderId == null) return Unauthorized();

        var notifications = new List<Notification>();

        foreach (var userId in request.UserIds)
        {
            if (Guid.TryParse(userId, out var userGuid))
            {
                notifications.Add(new Notification
                {
                    UserId = userGuid,
                    Title = request.Title ?? "Yeni Bildirim",
                    Message = request.Message,
                    Type = request.Type ?? "info",
                    SenderId = senderId,
                    IsRead = false
                });
            }
        }

        _context.Notifications.AddRange(notifications);
        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("SEND_BULK_NOTIFICATION", "Notification", null, null, 
            new { UserCount = notifications.Count, request.Title, request.Type }, 
            $"Toplu bildirim gönderildi: {notifications.Count} kullanıcıya");

        _logger.LogInformation("Bulk notification sent to {Count} users by {SenderId}", notifications.Count, senderId);

        return Ok(new { status = "sent", count = notifications.Count });
    }

    /// <summary>
    /// Send notification to users by role (Admin/Manager only)
    /// </summary>
    [HttpPost("by-role")]
    [Authorize(Policy = "RequireManagerRole")]
    public async Task<IActionResult> SendNotificationByRole([FromBody] RoleNotificationRequest request)
    {
        var senderId = GetCurrentUserId();
        if (senderId == null) return Unauthorized();

        // Get users by role
        var users = await _context.Users
            .Where(u => u.IsActive && request.Roles.Contains((int)u.Role))
            .Select(u => u.Id)
            .ToListAsync();

        var notifications = users.Select(userId => new Notification
        {
            UserId = userId,
            Title = request.Title ?? "Yeni Bildirim",
            Message = request.Message,
            Type = request.Type ?? "info",
            SenderId = senderId,
            IsRead = false
        }).ToList();

        _context.Notifications.AddRange(notifications);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Role-based notification sent to {Count} users by {SenderId}", notifications.Count, senderId);

        return Ok(new { status = "sent", count = notifications.Count, roles = request.Roles });
    }

    /// <summary>
    /// Get all notifications (Admin only) - for admin dashboard
    /// </summary>
    [HttpGet("all")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<IActionResult> GetAllNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var totalCount = await _context.Notifications.CountAsync();

        var notifications = await _context.Notifications
            .Include(n => n.User)
            .Include(n => n.Sender)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new
            {
                n.Id,
                n.Title,
                n.Message,
                n.Type,
                n.IsRead,
                n.ReadAt,
                n.CreatedAt,
                RecipientName = n.User.FirstName + " " + n.User.LastName,
                RecipientEmail = n.User.Email,
                SenderName = n.Sender != null ? n.Sender.FirstName + " " + n.Sender.LastName : "System"
            })
            .ToListAsync();

        return Ok(new
        {
            data = notifications,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    /// <summary>
    /// Get users list for notification sending
    /// </summary>
    [HttpGet("users")]
    [Authorize(Policy = "RequireManagerRole")]
    public async Task<IActionResult> GetUsersForNotification()
    {
        var users = await _context.Users
            .Where(u => u.IsActive)
            .OrderBy(u => u.FirstName)
            .Select(u => new
            {
                u.Id,
                Name = u.FirstName + " " + u.LastName,
                u.Email,
                Role = u.Role.ToString()
            })
            .ToListAsync();

        return Ok(users);
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdClaim, out var userId))
            return userId;
        return null;
    }
}

public class BulkNotificationRequest
{
    [Required]
    public List<string> UserIds { get; set; } = new();
    public string? Title { get; set; }
    [Required]
    public string Message { get; set; } = default!;
    public string? Type { get; set; } // "info", "warning", "error", "success"
}

public class RoleNotificationRequest
{
    [Required]
    public List<int> Roles { get; set; } = new(); // 1=Employee, 2=Manager, 3=Admin
    public string? Title { get; set; }
    [Required]
    public string Message { get; set; } = default!;
    public string? Type { get; set; }
}
