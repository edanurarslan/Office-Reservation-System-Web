using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfisYonetimSistemi.Infrastructure.Data;
using OfisYonetimSistemi.Domain.Entities;
using System.Security.Claims;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/logs")]
[Authorize(Policy = "RequireManagerRole")]
public class LogsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LogsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET /api/v1/logs - Tüm logları getir (filtreleme ile)
    [HttpGet]
    public async Task<IActionResult> GetLogs(
        [FromQuery] string? search,
        [FromQuery] string? action,
        [FromQuery] string? status,
        [FromQuery] string? entityType,
        [FromQuery] Guid? userId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var query = _context.AuditLogs
            .Include(l => l.User)
            .AsQueryable();

        // Arama filtresi
        if (!string.IsNullOrEmpty(search))
        {
            search = search.ToLower();
            query = query.Where(l => 
                (l.User != null && (l.User.Email.ToLower().Contains(search) || 
                 l.User.FirstName.ToLower().Contains(search) || 
                 l.User.LastName.ToLower().Contains(search))) ||
                l.Action.ToLower().Contains(search) ||
                l.EntityType.ToLower().Contains(search) ||
                (l.AdditionalData != null && l.AdditionalData.ToLower().Contains(search)));
        }

        // İşlem filtresi
        if (!string.IsNullOrEmpty(action) && action != "all")
        {
            query = query.Where(l => l.Action == action);
        }

        // Durum filtresi (AdditionalData içinde status varsa)
        if (!string.IsNullOrEmpty(status) && status != "all")
        {
            if (status == "error")
            {
                query = query.Where(l => l.Action.Contains("FAILED") || l.Action.Contains("ERROR"));
            }
            else if (status == "success")
            {
                query = query.Where(l => !l.Action.Contains("FAILED") && !l.Action.Contains("ERROR"));
            }
        }

        // Entity tipi filtresi
        if (!string.IsNullOrEmpty(entityType) && entityType != "all")
        {
            query = query.Where(l => l.EntityType == entityType);
        }

        // Kullanıcı filtresi
        if (userId.HasValue)
        {
            query = query.Where(l => l.UserId == userId.Value);
        }

        // Tarih aralığı
        if (from.HasValue)
        {
            query = query.Where(l => l.Timestamp >= from.Value);
        }
        if (to.HasValue)
        {
            query = query.Where(l => l.Timestamp <= to.Value);
        }

        var totalCount = await query.CountAsync();

        var logs = await query
            .OrderByDescending(l => l.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new
            {
                l.Id,
                l.Timestamp,
                User = l.User != null ? l.User.Email : "System",
                UserName = l.User != null ? $"{l.User.FirstName} {l.User.LastName}" : "Sistem",
                l.Action,
                Resource = l.EntityType + (l.EntityId.HasValue ? $"#{l.EntityId.Value.ToString().Substring(0, 8)}" : ""),
                ResourceType = l.EntityType.ToLower(),
                l.EntityType,
                l.EntityId,
                Status = l.Action.Contains("FAILED") || l.Action.Contains("ERROR") ? "error" : 
                         l.Action.Contains("WARNING") ? "warning" : "success",
                Details = l.AdditionalData ?? GetDefaultDetails(l.Action, l.EntityType),
                l.IpAddress,
                l.UserAgent
            })
            .ToListAsync();

        return Ok(new
        {
            data = logs,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    // GET /api/v1/logs/actions - Tüm benzersiz action'ları getir
    [HttpGet("actions")]
    public async Task<IActionResult> GetActions()
    {
        var actions = await _context.AuditLogs
            .Select(l => l.Action)
            .Distinct()
            .OrderBy(a => a)
            .ToListAsync();

        return Ok(actions);
    }

    // GET /api/v1/logs/entity-types - Tüm benzersiz entity tiplerini getir
    [HttpGet("entity-types")]
    public async Task<IActionResult> GetEntityTypes()
    {
        var types = await _context.AuditLogs
            .Select(l => l.EntityType)
            .Distinct()
            .Where(t => !string.IsNullOrEmpty(t))
            .OrderBy(t => t)
            .ToListAsync();

        return Ok(types);
    }

    // GET /api/v1/logs/stats - Log istatistikleri
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var today = DateTime.UtcNow.Date;
        var weekAgo = today.AddDays(-7);

        var totalLogs = await _context.AuditLogs.CountAsync();
        var todayLogs = await _context.AuditLogs.CountAsync(l => l.Timestamp >= today);
        var weekLogs = await _context.AuditLogs.CountAsync(l => l.Timestamp >= weekAgo);
        var errorLogs = await _context.AuditLogs.CountAsync(l => l.Action.Contains("FAILED") || l.Action.Contains("ERROR"));

        var actionStats = await _context.AuditLogs
            .GroupBy(l => l.Action)
            .Select(g => new { Action = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(10)
            .ToListAsync();

        return Ok(new
        {
            totalLogs,
            todayLogs,
            weekLogs,
            errorLogs,
            actionStats
        });
    }

    // POST /api/v1/logs - Yeni log oluştur (internal kullanım için)
    [HttpPost]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<IActionResult> CreateLog([FromBody] CreateLogRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        Guid? userId = userIdClaim != null ? Guid.Parse(userIdClaim.Value) : null;

        var log = new AuditLog
        {
            UserId = request.UserId ?? userId,
            Action = request.Action,
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            OldValues = request.OldValues,
            NewValues = request.NewValues,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers["User-Agent"].ToString(),
            AdditionalData = request.AdditionalData,
            Timestamp = DateTime.UtcNow
        };

        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();

        return Ok(new { id = log.Id, message = "Log kaydı oluşturuldu" });
    }

    // DELETE /api/v1/logs/cleanup - Eski logları temizle
    [HttpDelete("cleanup")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<IActionResult> CleanupOldLogs([FromQuery] int olderThanDays = 90)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-olderThanDays);
        
        var oldLogs = await _context.AuditLogs
            .Where(l => l.Timestamp < cutoffDate)
            .ToListAsync();

        var count = oldLogs.Count;
        _context.AuditLogs.RemoveRange(oldLogs);
        await _context.SaveChangesAsync();

        // Temizlik işlemini de logla
        var cleanupLog = new AuditLog
        {
            UserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value),
            Action = "CLEANUP",
            EntityType = "AuditLog",
            AdditionalData = $"{count} adet {olderThanDays} günden eski log silindi",
            Timestamp = DateTime.UtcNow
        };
        _context.AuditLogs.Add(cleanupLog);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"{count} adet eski log silindi" });
    }

    private static string GetDefaultDetails(string action, string entityType)
    {
        return action switch
        {
            "CREATE" => $"Yeni {entityType} oluşturuldu",
            "UPDATE" => $"{entityType} güncellendi",
            "DELETE" => $"{entityType} silindi",
            "LOGIN" => "Sisteme giriş yapıldı",
            "LOGOUT" => "Sistemden çıkış yapıldı",
            "LOGIN_FAILED" => "Başarısız giriş denemesi",
            "APPROVE" => $"{entityType} onaylandı",
            "REJECT" => $"{entityType} reddedildi",
            "EXPORT" => "Veri dışa aktarıldı",
            _ => $"{action} işlemi gerçekleştirildi"
        };
    }
}

public class CreateLogRequest
{
    public Guid? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid? EntityId { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? AdditionalData { get; set; }
}
