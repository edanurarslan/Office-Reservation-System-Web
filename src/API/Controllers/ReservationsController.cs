using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using OfisYonetimSistemi.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using OfisYonetimSistemi.Infrastructure.Services;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/reservations")]
public class ReservationsController : ControllerBase
{
    private readonly ICheckOutService _checkOutService;
    private readonly IAuditLogService _auditLogService;

    public ReservationsController(ICheckOutService checkOutService, IAuditLogService auditLogService)
    {
        _checkOutService = checkOutService;
        _auditLogService = auditLogService;
    }
    // POST /reservations
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateReservation([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromBody] CreateReservationRequest request)
    {
        // Çakışma kontrolü (örnek, gerçek mantık eklenmeli)
        var start = DateTime.Parse(request.StartsAt).ToUniversalTime();
        var end = DateTime.Parse(request.EndsAt).ToUniversalTime();
        var isConflict = await db.Reservations.AnyAsync(r => r.ResourceId.ToString() == request.ResourceId && r.StartsAt < end && r.EndsAt > start && r.Status == OfisYonetimSistemi.Domain.Enums.ReservationStatus.Confirmed);
        if (isConflict)
        {
            return Conflict(new { error = new { code = "RESERVATION_CONFLICT", message = "Resource is not available for the given time range" } });
        }
        // JWT token'dan kullanıcı ID'sini al
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { error = "Invalid user token" });
        }
        
        var reservation = new OfisYonetimSistemi.Domain.Entities.Reservation
        {
            Id = Guid.NewGuid(),
            UserId = userId, // JWT'den alınan gerçek kullanıcı ID'si
            ResourceType = request.ResourceType == "desk" ? OfisYonetimSistemi.Domain.Enums.ResourceType.Desk : OfisYonetimSistemi.Domain.Enums.ResourceType.Room,
            ResourceId = Guid.Parse(request.ResourceId),
            StartsAt = start,
            EndsAt = end,
            Status = OfisYonetimSistemi.Domain.Enums.ReservationStatus.Confirmed
        };
        db.Reservations.Add(reservation);
        await db.SaveChangesAsync();

        await _auditLogService.LogAsync("CREATE", "Reservation", reservation.Id, null, 
            new { reservation.ResourceType, reservation.ResourceId, reservation.StartsAt, reservation.EndsAt }, 
            $"Yeni rezervasyon oluşturuldu: {reservation.ResourceType}");

        return Ok(new { reservation.Id, reservation.ResourceType, reservation.ResourceId, reservation.StartsAt, reservation.EndsAt, reservation.Status });
    }

    // GET /reservations?userId=&from=&to=&status=
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetReservations([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromQuery] Guid? userId, [FromQuery] string? from, [FromQuery] string? to, [FromQuery] string? status)
    {
        var query = db.Reservations.AsQueryable();
        if (userId.HasValue) query = query.Where(r => r.UserId == userId.Value);
        if (!string.IsNullOrEmpty(from) && DateTime.TryParse(from, out var fromDate)) query = query.Where(r => r.StartsAt >= fromDate.ToUniversalTime());
        if (!string.IsNullOrEmpty(to) && DateTime.TryParse(to, out var toDate)) query = query.Where(r => r.EndsAt <= toDate.ToUniversalTime());
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<OfisYonetimSistemi.Domain.Enums.ReservationStatus>(status, out var stat)) query = query.Where(r => r.Status == stat);
        var reservations = await query.Select(r => new { r.Id, r.ResourceType, r.ResourceId, r.StartsAt, r.EndsAt, r.Status }).ToListAsync();
        return Ok(reservations);
    }

    // GET /reservations/my - Get current user's reservations
    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyReservations([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { error = "Invalid user token" });
        }
        
        var reservations = await db.Reservations
            .Where(r => r.UserId == userId)
            .Include(r => r.Desk)
                .ThenInclude(d => d != null ? d.Zone : null)
            .Include(r => r.Room)
            .Select(r => new 
            { 
                r.Id, 
                r.UserId,
                r.ResourceType, 
                r.ResourceId, 
                r.StartsAt, 
                r.EndsAt, 
                r.Status,
                DeskName = r.Desk != null ? r.Desk.Name : null,
                RoomName = r.Room != null ? r.Room.Name : null,
                r.CreatedAt,
                r.UpdatedAt
            })
            .OrderByDescending(r => r.StartsAt)
            .ToListAsync();
        
        return Ok(reservations);
    }

    // GET /reservations/{id}
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetReservationById([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromRoute] Guid id)
    {
        var r = await db.Reservations.FindAsync(id);
        if (r == null) return NotFound();
        return Ok(new { r.Id, r.ResourceType, r.ResourceId, r.StartsAt, r.EndsAt, r.Status });
    }

    // PATCH /reservations/{id}
    [HttpPatch("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateReservation([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromRoute] Guid id, [FromBody] UpdateReservationRequest request)
    {
        var r = await db.Reservations.FindAsync(id);
        if (r == null) return NotFound();
        
        var oldValues = new { r.ResourceType, r.ResourceId, r.StartsAt, r.EndsAt, r.Status };
        
        if (!string.IsNullOrEmpty(request.ResourceType)) r.ResourceType = request.ResourceType == "desk" ? OfisYonetimSistemi.Domain.Enums.ResourceType.Desk : OfisYonetimSistemi.Domain.Enums.ResourceType.Room;
        if (!string.IsNullOrEmpty(request.ResourceId)) r.ResourceId = Guid.Parse(request.ResourceId);
        if (!string.IsNullOrEmpty(request.StartsAt)) r.StartsAt = DateTime.Parse(request.StartsAt).ToUniversalTime();
        if (!string.IsNullOrEmpty(request.EndsAt)) r.EndsAt = DateTime.Parse(request.EndsAt).ToUniversalTime();
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<OfisYonetimSistemi.Domain.Enums.ReservationStatus>(request.Status, out var stat)) r.Status = stat;
        await db.SaveChangesAsync();

        await _auditLogService.LogAsync("UPDATE", "Reservation", r.Id, oldValues, 
            new { r.ResourceType, r.ResourceId, r.StartsAt, r.EndsAt, r.Status }, 
            $"Rezervasyon güncellendi");

        return Ok(new { r.Id, r.ResourceType, r.ResourceId, r.StartsAt, r.EndsAt, r.Status });
    }

    // DELETE /reservations/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteReservation([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromRoute] Guid id)
    {
        var r = await db.Reservations.FindAsync(id);
        if (r == null) return NotFound();
        
        await _auditLogService.LogAsync("DELETE", "Reservation", r.Id, 
            new { r.ResourceType, r.ResourceId, r.StartsAt, r.EndsAt }, null, 
            $"Rezervasyon silindi");

        db.Reservations.Remove(r);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // POST /reservations/{id}/checkout
    /// <summary>
    /// Check-out from a reservation (mark as completed)
    /// </summary>
    /// <param name="id">Reservation ID</param>
    /// <param name="request">Check-out request with optional device info</param>
    /// <returns>Check-out confirmation with duration</returns>
    [HttpPost("{id}/checkout")]
    [Authorize]
    public async Task<IActionResult> CheckOut([FromRoute] Guid id, [FromBody] CheckOutRequest? request = null)
    {
        try
        {
            var result = await _checkOutService.CheckOutAsync(id, request?.DeviceInfo);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = new { code = "CHECKOUT_ERROR", message = ex.Message } });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = new { code = "INTERNAL_ERROR", message = ex.Message } });
        }
    }

    // GET /reservations/{id}/duration
    /// <summary>
    /// Get check-in duration for a completed reservation
    /// </summary>
    /// <param name="id">Reservation ID</param>
    /// <returns>Duration in minutes</returns>
    [HttpGet("{id}/duration")]
    [Authorize]
    public async Task<IActionResult> GetCheckInDuration([FromRoute] Guid id)
    {
        var duration = await _checkOutService.GetCheckInDurationAsync(id);
        if (!duration.HasValue)
        {
            return NotFound(new { error = new { code = "DURATION_NOT_FOUND", message = "Duration not available for this reservation" } });
        }
        return Ok(new { reservationId = id, durationMinutes = duration.Value });
    }
}

public class CreateReservationRequest
{
    [Required]
    public string ResourceType { get; set; } = default!; // "desk" | "room"
    [Required]
    public string ResourceId { get; set; } = default!;
    [Required]
    public string StartsAt { get; set; } = default!; // ISO 8601
    [Required]
    public string EndsAt { get; set; } = default!; // ISO 8601
    public object? Meta { get; set; }
}

public class UpdateReservationRequest
{
    public string? ResourceType { get; set; }
    public string? ResourceId { get; set; }
    public string? StartsAt { get; set; }
    public string? EndsAt { get; set; }
    public string? Status { get; set; }
    public object? Meta { get; set; }
}

public class CheckOutRequest
{
    public string? DeviceInfo { get; set; }
}
