using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfisYonetimSistemi.Infrastructure.Data;
using OfisYonetimSistemi.Infrastructure.Services;

namespace OfisYonetimSistemi.API.Controllers;

/// <summary>
/// Zone management endpoints
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class ZonesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ZonesController> _logger;
    private readonly IAuditLogService _auditLogService;

    public ZonesController(ApplicationDbContext context, ILogger<ZonesController> logger, IAuditLogService auditLogService)
    {
        _context = context;
        _logger = logger;
        _auditLogService = auditLogService;
    }

    /// <summary>
    /// Get all zones, optionally filtered by floor
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetZones([FromQuery] Guid? floorId)
    {
        try
        {
            var query = _context.Zones
                .Include(z => z.Floor)
                    .ThenInclude(f => f.Location)
                .Include(z => z.Desks)
                .AsNoTracking();

            if (floorId.HasValue)
            {
                query = query.Where(z => z.FloorId == floorId.Value);
            }

            var zones = await query
                .Where(z => z.IsActive)
                .OrderBy(z => z.Floor.Name)
                .ThenBy(z => z.Name)
                .Select(z => new
                {
                    z.Id,
                    z.Name,
                    z.Description,
                    z.ZoneType,
                    z.IsActive,
                    z.MaxCapacity,
                    z.FloorId,
                    FloorName = z.Floor.Name,
                    LocationName = z.Floor.Location.Name,
                    DeskCount = z.Desks.Count,
                    ActiveDeskCount = z.Desks.Count(d => d.IsActive)
                })
                .ToListAsync();

            return Ok(zones);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving zones");
            return StatusCode(500, "Error retrieving zones");
        }
    }

    /// <summary>
    /// Get zone by ID with desks
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetZone(Guid id)
    {
        try
        {
            var zone = await _context.Zones
                .Include(z => z.Floor)
                    .ThenInclude(f => f.Location)
                .Include(z => z.Desks)
                .AsNoTracking()
                .Where(z => z.Id == id)
                .Select(z => new
                {
                    z.Id,
                    z.Name,
                    z.Description,
                    z.ZoneType,
                    z.IsActive,
                    z.MaxCapacity,
                    z.FloorId,
                    FloorName = z.Floor.Name,
                    LocationId = z.Floor.LocationId,
                    LocationName = z.Floor.Location.Name,
                    Desks = z.Desks.Select(d => new
                    {
                        d.Id,
                        d.Name,
                        d.Description,
                        d.IsActive,
                        d.HasMonitor,
                        d.HasKeyboard,
                        d.HasMouse,
                        d.HasDockingStation,
                        d.Features,
                        d.XCoordinate,
                        d.YCoordinate
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (zone == null)
                return NotFound($"Zone {id} not found");

            return Ok(zone);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving zone {ZoneId}", id);
            return StatusCode(500, "Error retrieving zone");
        }
    }

    /// <summary>
    /// Create a new zone
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateZone([FromBody] CreateZoneRequest request)
    {
        try
        {
            // Verify floor exists
            var floor = await _context.Floors.FindAsync(request.FloorId);
            if (floor == null)
                return NotFound($"Floor {request.FloorId} not found");

            var zone = new Domain.Entities.Zone
            {
                Name = request.Name,
                Description = request.Description,
                ZoneType = request.ZoneType ?? "open_office",
                IsActive = true,
                MaxCapacity = request.MaxCapacity,
                FloorId = request.FloorId
            };

            _context.Zones.Add(zone);
            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync("CREATE", "Zone", zone.Id, null, 
                new { zone.Name, zone.ZoneType, zone.FloorId }, 
                $"Yeni bölge oluşturuldu: {zone.Name}");

            _logger.LogInformation("Zone {ZoneName} created for floor {FloorId}", zone.Name, zone.FloorId);

            return CreatedAtAction(nameof(GetZone), new { id = zone.Id }, new
            {
                zone.Id,
                zone.Name,
                zone.Description,
                zone.ZoneType,
                zone.IsActive,
                zone.MaxCapacity,
                zone.FloorId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating zone");
            return StatusCode(500, "Error creating zone");
        }
    }

    /// <summary>
    /// Update zone
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateZone(Guid id, [FromBody] UpdateZoneRequest request)
    {
        try
        {
            var zone = await _context.Zones
                .Include(z => z.Floor)
                .FirstOrDefaultAsync(z => z.Id == id);
            if (zone == null)
                return NotFound($"Zone {id} not found");

            // Capture old values
            var oldValues = new 
            { 
                zone.Name, 
                zone.Description, 
                zone.ZoneType, 
                zone.IsActive, 
                zone.MaxCapacity,
                FloorName = zone.Floor?.Name
            };

            if (!string.IsNullOrEmpty(request.Name))
                zone.Name = request.Name;
            if (request.Description != null)
                zone.Description = request.Description;
            if (!string.IsNullOrEmpty(request.ZoneType))
                zone.ZoneType = request.ZoneType;
            if (request.IsActive.HasValue)
                zone.IsActive = request.IsActive.Value;
            if (request.MaxCapacity.HasValue)
                zone.MaxCapacity = request.MaxCapacity.Value;

            await _context.SaveChangesAsync();

            // Capture new values
            var newValues = new 
            { 
                zone.Name, 
                zone.Description, 
                zone.ZoneType, 
                zone.IsActive, 
                zone.MaxCapacity,
                FloorName = zone.Floor?.Name
            };

            // Log the update
            await _auditLogService.LogAsync(
                "UPDATE",
                "Zone",
                zone.Id,
                $"Bölge güncellendi: {zone.Name}",
                System.Text.Json.JsonSerializer.Serialize(oldValues),
                System.Text.Json.JsonSerializer.Serialize(newValues)
            );

            return Ok(new
            {
                zone.Id,
                zone.Name,
                zone.Description,
                zone.ZoneType,
                zone.IsActive,
                zone.MaxCapacity,
                zone.FloorId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating zone {ZoneId}", id);
            return StatusCode(500, "Error updating zone");
        }
    }

    /// <summary>
    /// Delete zone (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteZone(Guid id)
    {
        try
        {
            var zone = await _context.Zones
                .Include(z => z.Floor)
                .FirstOrDefaultAsync(z => z.Id == id);
            if (zone == null)
                return NotFound($"Zone {id} not found");

            // Capture zone info before deletion
            var deletedZoneInfo = new 
            { 
                zone.Name, 
                zone.Description, 
                zone.ZoneType, 
                zone.MaxCapacity,
                FloorName = zone.Floor?.Name
            };

            zone.IsActive = false;
            await _context.SaveChangesAsync();

            // Log the deletion
            await _auditLogService.LogAsync(
                "DELETE",
                "Zone",
                zone.Id,
                $"Bölge silindi: {zone.Name} (Kat: {zone.Floor?.Name})",
                System.Text.Json.JsonSerializer.Serialize(deletedZoneInfo),
                null
            );

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting zone {ZoneId}", id);
            return StatusCode(500, "Error deleting zone");
        }
    }
}

public class CreateZoneRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ZoneType { get; set; }
    public int? MaxCapacity { get; set; }
    public Guid FloorId { get; set; }
}

public class UpdateZoneRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? ZoneType { get; set; }
    public bool? IsActive { get; set; }
    public int? MaxCapacity { get; set; }
}
