using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/rules")]
public class RulesController : ControllerBase
{
    // GET /rules
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetRules([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db)
    {
        var rules = await db.Rules.Where(r => r.IsActive).Select(r => new { r.Id, r.Type, r.Configuration, r.Priority, r.ValidFrom, r.ValidUntil }).ToListAsync();
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
        return Ok(new { rule.Id, rule.Type, rule.Configuration });
    }
}

public class CreateRuleRequest
{
    [Required]
    public string Type { get; set; } = default!;
    [Required]
    public object Value { get; set; } = default!;
}
