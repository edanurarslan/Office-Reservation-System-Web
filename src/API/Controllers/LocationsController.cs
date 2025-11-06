using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/locations")]
public class LocationsController : ControllerBase
{
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
        return Ok(new { location.Id, location.Name, location.Address });
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
