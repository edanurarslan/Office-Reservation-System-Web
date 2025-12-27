using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using OfisYonetimSistemi.Infrastructure.Services;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/locations")]
public class LocationsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public LocationsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    // GET /locations
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetLocations([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db)
    {
        var locations = await db.Locations.Where(l => l.IsActive).Select(l => new { l.Id, l.Name, l.Address }).ToListAsync();
        return Ok(locations);
    }

    // POST /locations
    [HttpPost]
    [Authorize(Policy = "RequireManagerRole")]
    public async Task<IActionResult> CreateLocation([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromBody] CreateLocationRequest request)
    {
        var location = new OfisYonetimSistemi.Domain.Entities.Location
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Address = request.Address,
            IsActive = true
        };
        db.Locations.Add(location);
        await db.SaveChangesAsync();

        await _auditLogService.LogAsync("CREATE", "Location", location.Id, null, new { location.Name, location.Address }, $"Yeni konum oluşturuldu: {location.Name}");

        return Ok(new { location.Id, location.Name, location.Address });
    }

    // PUT /locations/{id}
    [HttpPut("{id}")]
    [Authorize(Policy = "RequireManagerRole")]
    public async Task<IActionResult> UpdateLocation([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromRoute] Guid id, [FromBody] UpdateLocationRequest request)
    {
        var location = await db.Locations.FindAsync(id);
        if (location == null)
            return NotFound($"Location {id} not found");

        // Capture old values
        var oldValues = new { location.Name, location.Address, location.IsActive };

        if (!string.IsNullOrEmpty(request.Name))
            location.Name = request.Name;
        if (request.Address != null)
            location.Address = request.Address;
        if (request.IsActive.HasValue)
            location.IsActive = request.IsActive.Value;

        await db.SaveChangesAsync();

        // Capture new values
        var newValues = new { location.Name, location.Address, location.IsActive };

        // Log the update
        await _auditLogService.LogAsync(
            "UPDATE",
            "Location",
            location.Id,
            $"Konum güncellendi: {location.Name}",
            System.Text.Json.JsonSerializer.Serialize(oldValues),
            System.Text.Json.JsonSerializer.Serialize(newValues)
        );

        return Ok(new { location.Id, location.Name, location.Address, location.IsActive });
    }

    // DELETE /locations/{id}
    [HttpDelete("{id}")]
    [Authorize(Policy = "RequireManagerRole")]
    public async Task<IActionResult> DeleteLocation([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromRoute] Guid id)
    {
        var location = await db.Locations.FindAsync(id);
        if (location == null)
            return NotFound($"Location {id} not found");

        // Capture location info before deletion
        var deletedLocationInfo = new { location.Name, location.Address };

        location.IsActive = false;
        await db.SaveChangesAsync();

        // Log the deletion
        await _auditLogService.LogAsync(
            "DELETE",
            "Location",
            location.Id,
            $"Konum silindi: {location.Name}",
            System.Text.Json.JsonSerializer.Serialize(deletedLocationInfo),
            null
        );

        return NoContent();
    }

    // GET /locations/{id}/floors
    [HttpGet("{id}/floors")]
    [Authorize]
    public async Task<IActionResult> GetFloors([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromRoute] Guid id)
    {
        var floors = await db.Floors.Where(f => f.LocationId == id && f.IsActive).Select(f => new { f.Id, f.Name, f.LocationId }).ToListAsync();
        return Ok(floors);
    }

    // GET /floors/{id}/zones
    [HttpGet("/floors/{floorId}/zones")]
    [Authorize]
    public async Task<IActionResult> GetZones([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromRoute] Guid floorId)
    {
        var zones = await db.Zones.Where(z => z.FloorId == floorId && z.IsActive).Select(z => new { z.Id, z.Name, z.FloorId }).ToListAsync();
        return Ok(zones);
    }

    // GET /desks
    [HttpGet("/desks")]
    [Authorize]
    public async Task<IActionResult> GetDesks([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromQuery] Guid? locationId, [FromQuery] Guid? floorId, [FromQuery] Guid? zoneId, [FromQuery] string? features)
    {
        var query = db.Desks.Where(d => d.IsActive);
        if (zoneId.HasValue) query = query.Where(d => d.ZoneId == zoneId.Value);
        var desks = await query.Select(d => new { d.Id, d.Name, d.ZoneId, d.Features }).ToListAsync();
        return Ok(desks);
    }

    // GET /rooms
    [HttpGet("/rooms")]
    [Authorize]
    public async Task<IActionResult> GetRooms([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromQuery] Guid? locationId, [FromQuery] int? capacity)
    {
        var query = db.Rooms.Where(r => r.IsActive);
        if (locationId.HasValue) query = query.Where(r => r.LocationId == locationId.Value);
        if (capacity.HasValue) query = query.Where(r => r.Capacity >= capacity.Value);
        var rooms = await query.Select(r => new { r.Id, r.Name, r.LocationId, r.Capacity }).ToListAsync();
        return Ok(rooms);
    }
}

public class CreateLocationRequest
{
    [Required]
    public string Name { get; set; } = default!;
    [Required]
    public string Address { get; set; } = default!;
}

public class UpdateLocationRequest
{
    public string? Name { get; set; }
    public string? Address { get; set; }
    public bool? IsActive { get; set; }
}
