using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using OfisYonetimSistemi.Infrastructure.Services;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/rules")]
public class RulesController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public RulesController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    // GET /rules
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetRules([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db)
    {
        var rules = await db.Rules.Where(r => r.IsActive).Select(r => new { r.Id, r.Name, r.Description, r.Type, r.Configuration, r.Priority, r.ValidFrom, r.ValidUntil, r.IsActive }).ToListAsync();
        return Ok(rules);
    }

    // POST /rules
    [HttpPost]
    [Authorize(Policy = "RequireManagerRole")]
    public async Task<IActionResult> CreateRule([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromBody] CreateRuleRequest request)
    {
        var rule = new OfisYonetimSistemi.Domain.Entities.Rule
        {
            Id = Guid.NewGuid(),
            Type = OfisYonetimSistemi.Domain.Enums.RuleType.Capacity, // Örnek, gerçek sistemde parse edilmeli
            Configuration = request.Value?.ToString() ?? "",
            IsActive = true,
            Name = request.Type,
            Description = "",
            Priority = 1
        };
        db.Rules.Add(rule);
        await db.SaveChangesAsync();

        await _auditLogService.LogAsync("CREATE", "Rule", rule.Id, null, new { rule.Name, rule.Type, rule.Configuration }, $"Yeni kural oluşturuldu: {rule.Name}");

        return Ok(new { rule.Id, rule.Type, rule.Configuration });
    }

    // PUT /rules/{id}
    [HttpPut("{id}")]
    [Authorize(Policy = "RequireManagerRole")]
    public async Task<IActionResult> UpdateRule([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromRoute] Guid id, [FromBody] UpdateRuleRequest request)
    {
        var rule = await db.Rules.FindAsync(id);
        if (rule == null)
            return NotFound($"Rule {id} not found");

        // Capture old values
        var oldValues = new 
        { 
            rule.Name, 
            rule.Description, 
            rule.Type, 
            rule.Configuration, 
            rule.Priority, 
            rule.ValidFrom, 
            rule.ValidUntil, 
            rule.IsActive 
        };

        if (!string.IsNullOrEmpty(request.Name))
            rule.Name = request.Name;
        if (request.Description != null)
            rule.Description = request.Description;
        if (request.Configuration != null)
            rule.Configuration = request.Configuration;
        if (request.Priority.HasValue)
            rule.Priority = request.Priority.Value;
        if (request.ValidFrom.HasValue)
            rule.ValidFrom = request.ValidFrom.Value;
        if (request.ValidUntil.HasValue)
            rule.ValidUntil = request.ValidUntil.Value;
        if (request.IsActive.HasValue)
            rule.IsActive = request.IsActive.Value;

        await db.SaveChangesAsync();

        // Capture new values
        var newValues = new 
        { 
            rule.Name, 
            rule.Description, 
            rule.Type, 
            rule.Configuration, 
            rule.Priority, 
            rule.ValidFrom, 
            rule.ValidUntil, 
            rule.IsActive 
        };

        // Log the update
        await _auditLogService.LogAsync(
            "UPDATE",
            "Rule",
            rule.Id,
            $"Kural güncellendi: {rule.Name}",
            System.Text.Json.JsonSerializer.Serialize(oldValues),
            System.Text.Json.JsonSerializer.Serialize(newValues)
        );

        return Ok(new 
        { 
            rule.Id, 
            rule.Name, 
            rule.Description, 
            rule.Type, 
            rule.Configuration, 
            rule.Priority, 
            rule.ValidFrom, 
            rule.ValidUntil, 
            rule.IsActive 
        });
    }

    // DELETE /rules/{id}
    [HttpDelete("{id}")]
    [Authorize(Policy = "RequireManagerRole")]
    public async Task<IActionResult> DeleteRule([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromRoute] Guid id)
    {
        var rule = await db.Rules.FindAsync(id);
        if (rule == null)
            return NotFound($"Rule {id} not found");

        // Capture rule info before deletion
        var deletedRuleInfo = new 
        { 
            rule.Name, 
            rule.Description, 
            rule.Type, 
            rule.Configuration, 
            rule.Priority 
        };

        rule.IsActive = false;
        await db.SaveChangesAsync();

        // Log the deletion
        await _auditLogService.LogAsync(
            "DELETE",
            "Rule",
            rule.Id,
            $"Kural silindi: {rule.Name}",
            System.Text.Json.JsonSerializer.Serialize(deletedRuleInfo),
            null
        );

        return NoContent();
    }
}

public class CreateRuleRequest
{
    [Required]
    public string Type { get; set; } = default!;
    [Required]
    public object Value { get; set; } = default!;
}

public class UpdateRuleRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Configuration { get; set; }
    public int? Priority { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
    public bool? IsActive { get; set; }
}
