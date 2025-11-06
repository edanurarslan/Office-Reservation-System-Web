using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using OfisYonetimSistemi.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/reservations")]
public class ReservationsController : ControllerBase
{
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
        if (!string.IsNullOrEmpty(request.ResourceType)) r.ResourceType = request.ResourceType == "desk" ? OfisYonetimSistemi.Domain.Enums.ResourceType.Desk : OfisYonetimSistemi.Domain.Enums.ResourceType.Room;
        if (!string.IsNullOrEmpty(request.ResourceId)) r.ResourceId = Guid.Parse(request.ResourceId);
        if (!string.IsNullOrEmpty(request.StartsAt)) r.StartsAt = DateTime.Parse(request.StartsAt).ToUniversalTime();
        if (!string.IsNullOrEmpty(request.EndsAt)) r.EndsAt = DateTime.Parse(request.EndsAt).ToUniversalTime();
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<OfisYonetimSistemi.Domain.Enums.ReservationStatus>(request.Status, out var stat)) r.Status = stat;
        await db.SaveChangesAsync();
        return Ok(new { r.Id, r.ResourceType, r.ResourceId, r.StartsAt, r.EndsAt, r.Status });
    }

    // DELETE /reservations/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteReservation([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromRoute] Guid id)
    {
        var r = await db.Reservations.FindAsync(id);
        if (r == null) return NotFound();
        db.Reservations.Remove(r);
        await db.SaveChangesAsync();
        return NoContent();
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
