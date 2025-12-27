using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfisYonetimSistemi.Infrastructure.Data;
using OfisYonetimSistemi.Infrastructure.Services;

namespace OfisYonetimSistemi.API.Controllers;

/// <summary>
/// Desk management endpoints
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class DesksController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DesksController> _logger;
    private readonly IAuditLogService _auditLogService;

    public DesksController(ApplicationDbContext context, ILogger<DesksController> logger, IAuditLogService auditLogService)
    {
        _context = context;
        _logger = logger;
        _auditLogService = auditLogService;
    }

    /// <summary>
    /// Get all desks, optionally filtered by zone
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetDesks([FromQuery] Guid? zoneId, [FromQuery] Guid? floorId)
    {
        try
        {
            var query = _context.Desks
                .Include(d => d.Zone)
                    .ThenInclude(z => z.Floor)
                        .ThenInclude(f => f.Location)
                .AsNoTracking();

            if (zoneId.HasValue)
            {
                query = query.Where(d => d.ZoneId == zoneId.Value);
            }
            else if (floorId.HasValue)
            {
                query = query.Where(d => d.Zone.FloorId == floorId.Value);
            }

            var desks = await query
                .Where(d => d.IsActive)
                .OrderBy(d => d.Zone.Name)
                .ThenBy(d => d.Name)
                .Select(d => new
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
                    d.YCoordinate,
                    d.ZoneId,
                    ZoneName = d.Zone.Name,
                    FloorId = d.Zone.FloorId,
                    FloorName = d.Zone.Floor.Name,
                    LocationId = d.Zone.Floor.LocationId,
                    LocationName = d.Zone.Floor.Location.Name
                })
                .ToListAsync();

            return Ok(desks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving desks");
            return StatusCode(500, "Error retrieving desks");
        }
    }

    /// <summary>
    /// Get desk by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetDesk(Guid id)
    {
        try
        {
            var desk = await _context.Desks
                .Include(d => d.Zone)
                    .ThenInclude(z => z.Floor)
                        .ThenInclude(f => f.Location)
                .AsNoTracking()
                .Where(d => d.Id == id)
                .Select(d => new
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
                    d.YCoordinate,
                    d.ZoneId,
                    ZoneName = d.Zone.Name,
                    FloorId = d.Zone.FloorId,
                    FloorName = d.Zone.Floor.Name,
                    LocationId = d.Zone.Floor.LocationId,
                    LocationName = d.Zone.Floor.Location.Name
                })
                .FirstOrDefaultAsync();

            if (desk == null)
                return NotFound($"Desk {id} not found");

            return Ok(desk);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving desk {DeskId}", id);
            return StatusCode(500, "Error retrieving desk");
        }
    }

    /// <summary>
    /// Create a new desk
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateDesk([FromBody] CreateDeskRequest request)
    {
        try
        {
            // Verify zone exists
            var zone = await _context.Zones.FindAsync(request.ZoneId);
            if (zone == null)
                return NotFound($"Zone {request.ZoneId} not found");

            var desk = new Domain.Entities.Desk
            {
                Name = request.Name,
                Description = request.Description,
                IsActive = true,
                HasMonitor = request.HasMonitor ?? false,
                HasKeyboard = request.HasKeyboard ?? false,
                HasMouse = request.HasMouse ?? false,
                HasDockingStation = request.HasDockingStation ?? false,
                Features = request.Features,
                XCoordinate = request.XCoordinate,
                YCoordinate = request.YCoordinate,
                ZoneId = request.ZoneId
            };

            _context.Desks.Add(desk);
            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync("CREATE", "Desk", desk.Id, null, 
                new { desk.Name, desk.ZoneId, desk.XCoordinate, desk.YCoordinate }, 
                $"Yeni masa oluşturuldu: {desk.Name}");

            _logger.LogInformation("Desk {DeskName} created in zone {ZoneId}", desk.Name, desk.ZoneId);

            return CreatedAtAction(nameof(GetDesk), new { id = desk.Id }, new
            {
                desk.Id,
                desk.Name,
                desk.Description,
                desk.IsActive,
                desk.HasMonitor,
                desk.HasKeyboard,
                desk.HasMouse,
                desk.HasDockingStation,
                desk.Features,
                desk.XCoordinate,
                desk.YCoordinate,
                desk.ZoneId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating desk");
            return StatusCode(500, "Error creating desk");
        }
    }

    /// <summary>
    /// Update desk
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDesk(Guid id, [FromBody] UpdateDeskRequest request)
    {
        try
        {
            var desk = await _context.Desks.FindAsync(id);
            if (desk == null)
                return NotFound($"Desk {id} not found");

            var oldValues = new { desk.Name, desk.Description, desk.IsActive, desk.XCoordinate, desk.YCoordinate };

            if (!string.IsNullOrEmpty(request.Name))
                desk.Name = request.Name;
            if (request.Description != null)
                desk.Description = request.Description;
            if (request.IsActive.HasValue)
                desk.IsActive = request.IsActive.Value;
            if (request.HasMonitor.HasValue)
                desk.HasMonitor = request.HasMonitor.Value;
            if (request.HasKeyboard.HasValue)
                desk.HasKeyboard = request.HasKeyboard.Value;
            if (request.HasMouse.HasValue)
                desk.HasMouse = request.HasMouse.Value;
            if (request.HasDockingStation.HasValue)
                desk.HasDockingStation = request.HasDockingStation.Value;
            if (request.Features != null)
                desk.Features = request.Features;
            if (request.XCoordinate.HasValue)
                desk.XCoordinate = request.XCoordinate.Value;
            if (request.YCoordinate.HasValue)
                desk.YCoordinate = request.YCoordinate.Value;

            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync("UPDATE", "Desk", desk.Id, oldValues, 
                new { desk.Name, desk.Description, desk.IsActive, desk.XCoordinate, desk.YCoordinate }, 
                $"Masa güncellendi: {desk.Name}");

            return Ok(new
            {
                desk.Id,
                desk.Name,
                desk.Description,
                desk.IsActive,
                desk.HasMonitor,
                desk.HasKeyboard,
                desk.HasMouse,
                desk.HasDockingStation,
                desk.Features,
                desk.XCoordinate,
                desk.YCoordinate,
                desk.ZoneId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating desk {DeskId}", id);
            return StatusCode(500, "Error updating desk");
        }
    }

    /// <summary>
    /// Update desk position (for floor plan drag-drop)
    /// </summary>
    [HttpPut("{id}/position")]
    public async Task<IActionResult> UpdateDeskPosition(Guid id, [FromBody] UpdateDeskPositionRequest request)
    {
        try
        {
            var desk = await _context.Desks.FindAsync(id);
            if (desk == null)
                return NotFound($"Desk {id} not found");

            var oldPosition = new { desk.XCoordinate, desk.YCoordinate };

            desk.XCoordinate = request.XCoordinate;
            desk.YCoordinate = request.YCoordinate;

            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync("UPDATE_POSITION", "Desk", desk.Id, oldPosition, 
                new { desk.XCoordinate, desk.YCoordinate }, 
                $"Masa pozisyonu güncellendi: {desk.Name}");

            _logger.LogInformation("Desk {DeskId} position updated to ({X}, {Y})", id, request.XCoordinate, request.YCoordinate);

            return Ok(new
            {
                desk.Id,
                desk.Name,
                desk.XCoordinate,
                desk.YCoordinate
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating desk position {DeskId}", id);
            return StatusCode(500, "Error updating desk position");
        }
    }

    /// <summary>
    /// Batch update desk positions (for floor plan editor)
    /// </summary>
    [HttpPut("positions")]
    public async Task<IActionResult> UpdateDeskPositions([FromBody] List<UpdateDeskPositionRequest> requests)
    {
        try
        {
            var deskIds = requests.Select(r => r.DeskId).ToList();
            var desks = await _context.Desks
                .Where(d => deskIds.Contains(d.Id))
                .ToListAsync();

            // Capture old positions
            var oldPositions = desks.Select(d => new { d.Id, d.Name, d.XCoordinate, d.YCoordinate }).ToList();

            foreach (var desk in desks)
            {
                var request = requests.FirstOrDefault(r => r.DeskId == desk.Id);
                if (request != null)
                {
                    desk.XCoordinate = request.XCoordinate;
                    desk.YCoordinate = request.YCoordinate;
                }
            }

            await _context.SaveChangesAsync();

            // Capture new positions
            var newPositions = desks.Select(d => new { d.Id, d.Name, d.XCoordinate, d.YCoordinate }).ToList();

            // Log the batch update
            await _auditLogService.LogAsync(
                "BATCH_UPDATE_POSITIONS",
                "Desk",
                Guid.Empty,
                $"{desks.Count} masa pozisyonu güncellendi",
                System.Text.Json.JsonSerializer.Serialize(oldPositions),
                System.Text.Json.JsonSerializer.Serialize(newPositions)
            );

            _logger.LogInformation("Updated positions for {Count} desks", desks.Count);

            return Ok(new { UpdatedCount = desks.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error batch updating desk positions");
            return StatusCode(500, "Error updating desk positions");
        }
    }

    /// <summary>
    /// Delete desk (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDesk(Guid id)
    {
        try
        {
            var desk = await _context.Desks
                .Include(d => d.Zone)
                .ThenInclude(z => z.Floor)
                .FirstOrDefaultAsync(d => d.Id == id);
            if (desk == null)
                return NotFound($"Desk {id} not found");

            // Capture desk info before deletion for logging
            var deletedDeskInfo = new 
            { 
                desk.Name, 
                desk.Description, 
                ZoneName = desk.Zone?.Name,
                FloorName = desk.Zone?.Floor?.Name,
                desk.XCoordinate, 
                desk.YCoordinate 
            };

            desk.IsActive = false;
            await _context.SaveChangesAsync();

            // Log the deletion
            await _auditLogService.LogAsync(
                "DELETE",
                "Desk",
                desk.Id,
                $"Masa silindi: {desk.Name} (Zon: {desk.Zone?.Name})",
                System.Text.Json.JsonSerializer.Serialize(deletedDeskInfo),
                null
            );

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting desk {DeskId}", id);
            return StatusCode(500, "Error deleting desk");
        }
    }
}

public class CreateDeskRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool? HasMonitor { get; set; }
    public bool? HasKeyboard { get; set; }
    public bool? HasMouse { get; set; }
    public bool? HasDockingStation { get; set; }
    public string? Features { get; set; }
    public decimal? XCoordinate { get; set; }
    public decimal? YCoordinate { get; set; }
    public Guid ZoneId { get; set; }
}

public class UpdateDeskRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
    public bool? HasMonitor { get; set; }
    public bool? HasKeyboard { get; set; }
    public bool? HasMouse { get; set; }
    public bool? HasDockingStation { get; set; }
    public string? Features { get; set; }
    public decimal? XCoordinate { get; set; }
    public decimal? YCoordinate { get; set; }
}

public class UpdateDeskPositionRequest
{
    public Guid DeskId { get; set; }
    public decimal XCoordinate { get; set; }
    public decimal YCoordinate { get; set; }
}
