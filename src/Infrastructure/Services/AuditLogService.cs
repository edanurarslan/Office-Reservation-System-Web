using Microsoft.AspNetCore.Http;
using OfisYonetimSistemi.Domain.Entities;
using OfisYonetimSistemi.Infrastructure.Data;
using System.Security.Claims;
using System.Text.Json;

namespace OfisYonetimSistemi.Infrastructure.Services;

public interface IAuditLogService
{
    Task LogAsync(string action, string entityType, Guid? entityId = null, object? oldValues = null, object? newValues = null, string? additionalData = null);
    Task LogLoginAsync(Guid userId, bool success, string? failureReason = null);
    Task LogLogoutAsync(Guid userId);
}

public class AuditLogService : IAuditLogService
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditLogService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        return null;
    }

    private string? GetIpAddress()
    {
        return _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();
    }

    private string? GetUserAgent()
    {
        return _httpContextAccessor.HttpContext?.Request?.Headers["User-Agent"].ToString();
    }

    public async Task LogAsync(string action, string entityType, Guid? entityId = null, object? oldValues = null, object? newValues = null, string? additionalData = null)
    {
        var log = new AuditLog
        {
            UserId = GetCurrentUserId(),
            Action = action.ToUpper(),
            EntityType = entityType,
            EntityId = entityId,
            OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
            NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
            IpAddress = GetIpAddress(),
            UserAgent = GetUserAgent(),
            AdditionalData = additionalData,
            Timestamp = DateTime.UtcNow
        };

        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();
    }

    public async Task LogLoginAsync(Guid userId, bool success, string? failureReason = null)
    {
        var log = new AuditLog
        {
            UserId = userId,
            Action = success ? "LOGIN" : "LOGIN_FAILED",
            EntityType = "User",
            EntityId = userId,
            IpAddress = GetIpAddress(),
            UserAgent = GetUserAgent(),
            AdditionalData = success ? "Başarılı giriş" : $"Başarısız giriş: {failureReason}",
            Timestamp = DateTime.UtcNow
        };

        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();
    }

    public async Task LogLogoutAsync(Guid userId)
    {
        var log = new AuditLog
        {
            UserId = userId,
            Action = "LOGOUT",
            EntityType = "User",
            EntityId = userId,
            IpAddress = GetIpAddress(),
            UserAgent = GetUserAgent(),
            AdditionalData = "Sistemden çıkış yapıldı",
            Timestamp = DateTime.UtcNow
        };

        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();
    }
}
