using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfisYonetimSistemi.Infrastructure.Data;
using OfisYonetimSistemi.Infrastructure.Services;

namespace OfisYonetimSistemi.API.Controllers;

/// <summary>
/// Floor management endpoints
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class FloorsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FloorsController> _logger;
    private readonly IAuditLogService _auditLogService;

    public FloorsController(ApplicationDbContext context, ILogger<FloorsController> logger, IAuditLogService auditLogService)
    {
        _context = context;
        _logger = logger;
        _auditLogService = auditLogService;
    }

    /// <summary>
    /// Get all floors, optionally filtered by location
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetFloors([FromQuery] Guid? locationId)
    {
        try
        {
            var query = _context.Floors
                .Include(f => f.Location)
                .Include(f => f.Zones)
                    .ThenInclude(z => z.Desks)
                .AsNoTracking();

            if (locationId.HasValue)
            {
                query = query.Where(f => f.LocationId == locationId.Value);
            }

            var floors = await query
                .Where(f => f.IsActive)
                .OrderBy(f => f.Location.Name)
                .ThenBy(f => f.FloorNumber)
                .Select(f => new
                {
                    f.Id,
                    f.Name,
                    f.FloorNumber,
                    f.Description,
                    f.IsActive,
                    f.FloorPlanImageUrl,
                    f.LocationId,
                    LocationName = f.Location.Name,
                    ZoneCount = f.Zones.Count,
                    DeskCount = f.Zones.SelectMany(z => z.Desks).Count()
                })
                .ToListAsync();

            return Ok(floors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving floors");
            return StatusCode(500, "Error retrieving floors");
        }
    }

    /// <summary>
    /// Get floor by ID with zones and desks
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetFloor(Guid id)
    {
        try
        {
            var floor = await _context.Floors
                .Include(f => f.Location)
                .Include(f => f.Zones)
                    .ThenInclude(z => z.Desks)
                .AsNoTracking()
                .Where(f => f.Id == id)
                .Select(f => new
                {
                    f.Id,
                    f.Name,
                    f.FloorNumber,
                    f.Description,
                    f.IsActive,
                    f.FloorPlanImageUrl,
                    f.LocationId,
                    LocationName = f.Location.Name,
                    Zones = f.Zones.Select(z => new
                    {
                        z.Id,
                        z.Name,
                        z.Description,
                        z.ZoneType,
                        z.IsActive,
                        z.MaxCapacity,
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
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (floor == null)
                return NotFound($"Floor {id} not found");

            return Ok(floor);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving floor {FloorId}", id);
            return StatusCode(500, "Error retrieving floor");
        }
    }

    /// <summary>
    /// Create a new floor
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateFloor([FromBody] CreateFloorRequest request)
    {
        try
        {
            // Verify location exists
            var location = await _context.Locations.FindAsync(request.LocationId);
            if (location == null)
                return NotFound($"Location {request.LocationId} not found");

            var floor = new Domain.Entities.Floor
            {
                Name = request.Name,
                FloorNumber = request.FloorNumber,
                Description = request.Description,
                IsActive = true,
                FloorPlanImageUrl = request.FloorPlanImageUrl,
                LocationId = request.LocationId
            };

            _context.Floors.Add(floor);
            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync("CREATE", "Floor", floor.Id, null, 
                new { floor.Name, floor.FloorNumber, floor.LocationId }, 
                $"Yeni kat oluşturuldu: {floor.Name}");

            _logger.LogInformation("Floor {FloorName} created for location {LocationId}", floor.Name, floor.LocationId);

            return CreatedAtAction(nameof(GetFloor), new { id = floor.Id }, new
            {
                floor.Id,
                floor.Name,
                floor.FloorNumber,
                floor.Description,
                floor.IsActive,
                floor.FloorPlanImageUrl,
                floor.LocationId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating floor");
            return StatusCode(500, "Error creating floor");
        }
    }

    /// <summary>
    /// Update floor
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFloor(Guid id, [FromBody] UpdateFloorRequest request)
    {
        try
        {
            var floor = await _context.Floors
                .Include(f => f.Location)
                .FirstOrDefaultAsync(f => f.Id == id);
            if (floor == null)
                return NotFound($"Floor {id} not found");

            // Capture old values
            var oldValues = new 
            { 
                floor.Name, 
                floor.FloorNumber, 
                floor.Description, 
                floor.IsActive, 
                floor.FloorPlanImageUrl,
                LocationName = floor.Location?.Name
            };

            if (!string.IsNullOrEmpty(request.Name))
                floor.Name = request.Name;
            if (request.FloorNumber.HasValue)
                floor.FloorNumber = request.FloorNumber.Value;
            if (request.Description != null)
                floor.Description = request.Description;
            if (request.IsActive.HasValue)
                floor.IsActive = request.IsActive.Value;
            if (request.FloorPlanImageUrl != null)
                floor.FloorPlanImageUrl = request.FloorPlanImageUrl;

            await _context.SaveChangesAsync();

            // Capture new values
            var newValues = new 
            { 
                floor.Name, 
                floor.FloorNumber, 
                floor.Description, 
                floor.IsActive, 
                floor.FloorPlanImageUrl,
                LocationName = floor.Location?.Name
            };

            // Log the update
            await _auditLogService.LogAsync(
                "UPDATE",
                "Floor",
                floor.Id,
                $"Kat güncellendi: {floor.Name}",
                System.Text.Json.JsonSerializer.Serialize(oldValues),
                System.Text.Json.JsonSerializer.Serialize(newValues)
            );

            return Ok(new
            {
                floor.Id,
                floor.Name,
                floor.FloorNumber,
                floor.Description,
                floor.IsActive,
                floor.FloorPlanImageUrl,
                floor.LocationId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating floor {FloorId}", id);
            return StatusCode(500, "Error updating floor");
        }
    }

    /// <summary>
    /// Delete floor (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFloor(Guid id)
    {
        try
        {
            var floor = await _context.Floors
                .Include(f => f.Location)
                .FirstOrDefaultAsync(f => f.Id == id);
            if (floor == null)
                return NotFound($"Floor {id} not found");

            // Capture floor info before deletion
            var deletedFloorInfo = new 
            { 
                floor.Name, 
                floor.FloorNumber, 
                floor.Description, 
                LocationName = floor.Location?.Name 
            };

            floor.IsActive = false;
            await _context.SaveChangesAsync();

            // Log the deletion
            await _auditLogService.LogAsync(
                "DELETE",
                "Floor",
                floor.Id,
                $"Kat silindi: {floor.Name} (Lokasyon: {floor.Location?.Name})",
                System.Text.Json.JsonSerializer.Serialize(deletedFloorInfo),
                null
            );

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting floor {FloorId}", id);
            return StatusCode(500, "Error deleting floor");
        }
    }
}

public class CreateFloorRequest
{
    public string Name { get; set; } = string.Empty;
    public int FloorNumber { get; set; }
    public string? Description { get; set; }
    public string? FloorPlanImageUrl { get; set; }
    public Guid LocationId { get; set; }
}

public class UpdateFloorRequest
{
    public string? Name { get; set; }
    public int? FloorNumber { get; set; }
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
    public string? FloorPlanImageUrl { get; set; }
}
