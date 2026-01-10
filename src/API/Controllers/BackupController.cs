using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfisYonetimSistemi.Infrastructure.Data;
using OfisYonetimSistemi.Domain.Entities;
using OfisYonetimSistemi.Domain.Enums;
using System.Text.Json;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/backup")]
public class BackupController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public BackupController(ApplicationDbContext db)
    {
        _db = db;
    }

    // GET: /api/v1/backup
    [HttpGet]
    public async Task<IActionResult> GetBackup()
    {
        // Tüm önemli verileri çek
        var users = await _db.Users
            .Select(u => new {
                u.Id, u.FirstName, u.LastName, u.Email, u.Role, u.Department, u.JobTitle, u.PhoneNumber, u.IsActive, u.CreatedAt
            })
            .AsNoTracking().ToListAsync();
        var reservations = await _db.Reservations
            .Select(r => new {
                r.Id, r.UserId, r.StartsAt, r.EndsAt, r.Status, r.ResourceType, r.ResourceId, r.CreatedAt, r.UpdatedAt
            })
            .AsNoTracking().ToListAsync();
        var logs = await _db.AuditLogs
            .Select(l => new {
                l.Id, l.Timestamp, l.UserId, l.Action, l.EntityType, l.EntityId, l.OldValues, l.NewValues, l.IpAddress, l.UserAgent, l.AdditionalData
            })
            .AsNoTracking().ToListAsync();
        var notifications = await _db.Notifications
            .Select(n => new {
                n.Id, n.UserId, n.Title, n.Message, n.Type, n.CreatedAt, n.IsRead
            })
            .AsNoTracking().ToListAsync();
        var rules = await _db.Rules
            .Select(r => new {
                r.Id, r.Name, r.Description, r.IsActive, r.CreatedAt, r.UpdatedAt
            })
            .AsNoTracking().ToListAsync();
        // Gerekirse daha fazla tablo ekle

        var backup = new
        {
            users,
            reservations,
            logs,
            notifications,
            rules
        };
        var json = JsonSerializer.Serialize(backup, new JsonSerializerOptions { WriteIndented = true });
        var fileName = $"backup-{DateTime.UtcNow:yyyyMMdd-HHmmss}.json";
        return File(System.Text.Encoding.UTF8.GetBytes(json), "application/json", fileName);
    }

    // POST: /api/v1/backup/restore
    [HttpPost("restore")]
    public async Task<IActionResult> RestoreBackup(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Dosya yüklenmedi." });

        try
        {
            using var stream = new StreamReader(file.OpenReadStream());
            var json = await stream.ReadToEndAsync();
            var backupData = JsonSerializer.Deserialize<BackupData>(json, new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true 
            });

            if (backupData == null)
                return BadRequest(new { message = "Geçersiz yedek dosyası." });

            var restoredCounts = new Dictionary<string, int>();

            // Restore Notifications
            if (backupData.Notifications?.Any() == true)
            {
                foreach (var n in backupData.Notifications)
                {
                    var exists = await _db.Notifications.AnyAsync(x => x.Id == n.Id);
                    if (!exists)
                    {
                        _db.Notifications.Add(new Notification
                        {
                            Id = n.Id,
                            UserId = n.UserId,
                            Title = n.Title ?? "",
                            Message = n.Message ?? "",
                            Type = n.Type ?? "Info",
                            CreatedAt = n.CreatedAt,
                            IsRead = n.IsRead
                        });
                    }
                }
                restoredCounts["notifications"] = backupData.Notifications.Count;
            }

            // Restore Rules
            if (backupData.Rules?.Any() == true)
            {
                foreach (var r in backupData.Rules)
                {
                    var exists = await _db.Rules.AnyAsync(x => x.Id == r.Id);
                    if (!exists)
                    {
                        _db.Rules.Add(new Rule
                        {
                            Id = r.Id,
                            Name = r.Name ?? "",
                            Description = r.Description ?? "",
                            IsActive = r.IsActive,
                            CreatedAt = r.CreatedAt,
                            UpdatedAt = r.UpdatedAt
                        });
                    }
                }
                restoredCounts["rules"] = backupData.Rules.Count;
            }

            await _db.SaveChangesAsync();

            return Ok(new { 
                message = "Yedek başarıyla geri yüklendi.", 
                restoredCounts 
            });
        }
        catch (JsonException)
        {
            return BadRequest(new { message = "Geçersiz JSON formatı." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Geri yükleme hatası: {ex.Message}" });
        }
    }
}

// DTO classes for backup restore
public class BackupData
{
    public List<BackupUser>? Users { get; set; }
    public List<BackupReservation>? Reservations { get; set; }
    public List<BackupLog>? Logs { get; set; }
    public List<BackupNotification>? Notifications { get; set; }
    public List<BackupRule>? Rules { get; set; }
}

public class BackupUser
{
    public Guid Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public UserRole Role { get; set; }
    public string? Department { get; set; }
    public string? JobTitle { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class BackupReservation
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public ReservationStatus Status { get; set; }
    public ResourceType ResourceType { get; set; }
    public Guid ResourceId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class BackupLog
{
    public Guid Id { get; set; }
    public DateTime Timestamp { get; set; }
    public Guid? UserId { get; set; }
    public string? Action { get; set; }
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? AdditionalData { get; set; }
}

public class BackupNotification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? Title { get; set; }
    public string? Message { get; set; }
    public string? Type { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}

public class BackupRule
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
