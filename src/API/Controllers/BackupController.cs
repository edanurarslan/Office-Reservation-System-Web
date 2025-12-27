using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfisYonetimSistemi.Infrastructure.Data;
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
}
