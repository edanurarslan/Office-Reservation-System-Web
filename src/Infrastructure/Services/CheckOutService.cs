using OfisYonetimSistemi.Domain.Entities;
using OfisYonetimSistemi.Domain.Enums;
using OfisYonetimSistemi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace OfisYonetimSistemi.Infrastructure.Services;

/// <summary>
/// Service for handling check-out operations and occupancy analytics
/// </summary>
public interface ICheckOutService
{
    /// <summary>
    /// Manually check-out from a reservation
    /// </summary>
    /// <param name="reservationId">Reservation ID</param>
    /// <param name="deviceInfo">Device that performed check-out</param>
    /// <returns>Check-out confirmation with duration</returns>
    Task<CheckOutResult> CheckOutAsync(Guid reservationId, string? deviceInfo = null);

    /// <summary>
    /// Automatically check-out all expired reservations (no-show detection)
    /// </summary>
    /// <returns>Number of reservations checked out</returns>
    Task<int> AutoCheckOutExpiredReservationsAsync();

    /// <summary>
    /// Get check-in duration for a completed reservation
    /// </summary>
    /// <param name="reservationId">Reservation ID</param>
    /// <returns>Duration in minutes, or null if still checked in</returns>
    Task<int?> GetCheckInDurationAsync(Guid reservationId);
}

/// <summary>
/// Result of a check-out operation
/// </summary>
public class CheckOutResult
{
    public Guid CheckOutId { get; set; }
    public Guid ReservationId { get; set; }
    public DateTime CheckOutTime { get; set; }
    public int DurationMinutes { get; set; }
    public string Status { get; set; } = "checked_out";
    public string Message { get; set; } = string.Empty;
}

public class CheckOutService : ICheckOutService
{
    private readonly ApplicationDbContext _context;

    public CheckOutService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CheckOutResult> CheckOutAsync(Guid reservationId, string? deviceInfo = null)
    {
        var reservation = await _context.Reservations
            .Include(r => r.CheckIns)
            .FirstOrDefaultAsync(r => r.Id == reservationId);

        if (reservation == null)
            throw new InvalidOperationException($"Reservation {reservationId} not found");

        if (reservation.Status != ReservationStatus.CheckedIn)
            throw new InvalidOperationException($"Reservation is not checked in. Current status: {reservation.Status}");

        if (!reservation.CheckInAt.HasValue)
            throw new InvalidOperationException("Reservation has not been checked in yet");

        var now = DateTime.UtcNow;
        var durationMinutes = (int)(now - reservation.CheckInAt.Value).TotalMinutes;

        // Update reservation
        reservation.CheckOutAt = now;
        reservation.Status = ReservationStatus.Completed;
        _context.Reservations.Update(reservation);

        // Create CheckIn record for check-out event
        var checkIn = new CheckIn
        {
            Id = Guid.NewGuid(),
            UserId = reservation.UserId,
            ReservationId = reservationId,
            Type = CheckInType.CheckOut,
            Timestamp = now,
            DeviceInfo = deviceInfo,
            CreatedAt = now,
            UpdatedAt = now
        };

        _context.CheckIns.Add(checkIn);
        await _context.SaveChangesAsync();

        return new CheckOutResult
        {
            CheckOutId = checkIn.Id,
            ReservationId = reservationId,
            CheckOutTime = now,
            DurationMinutes = durationMinutes,
            Status = "checked_out",
            Message = $"Successfully checked out. Duration: {durationMinutes} minutes"
        };
    }

    public async Task<int> AutoCheckOutExpiredReservationsAsync()
    {
        var now = DateTime.UtcNow;
        var expiredReservations = await _context.Reservations
            .Include(r => r.CheckIns)
            .Where(r => 
                r.Status == ReservationStatus.CheckedIn && 
                r.EndsAt <= now &&
                r.CheckInAt.HasValue)
            .ToListAsync();

        int checkedOutCount = 0;
        var currentTime = DateTime.UtcNow;

        foreach (var reservation in expiredReservations)
        {
            reservation.CheckOutAt = currentTime;
            reservation.Status = ReservationStatus.Completed;
            _context.Reservations.Update(reservation);

            // Record auto check-out event
            var checkIn = new CheckIn
            {
                Id = Guid.NewGuid(),
                UserId = reservation.UserId,
                ReservationId = reservation.Id,
                Type = CheckInType.CheckOut,
                Timestamp = currentTime,
                DeviceInfo = "System - Auto Checkout",
                Notes = "Automatically checked out due to reservation end time",
                CreatedAt = currentTime,
                UpdatedAt = currentTime
            };

            _context.CheckIns.Add(checkIn);
            checkedOutCount++;
        }

        // Handle no-shows (reservations that expired without checking in)
        var noShowReservations = await _context.Reservations
            .Where(r => 
                r.Status == ReservationStatus.Confirmed && 
                r.EndsAt <= now &&
                !r.CheckInAt.HasValue)
            .ToListAsync();

        foreach (var reservation in noShowReservations)
        {
            reservation.Status = ReservationStatus.NoShow;
            reservation.CancelledAt = currentTime;
            reservation.CancellationReason = "No-show: Did not check in within reservation time";
            _context.Reservations.Update(reservation);
            checkedOutCount++;
        }

        if (checkedOutCount > 0)
            await _context.SaveChangesAsync();

        return checkedOutCount;
    }

    public async Task<int?> GetCheckInDurationAsync(Guid reservationId)
    {
        var reservation = await _context.Reservations
            .FirstOrDefaultAsync(r => r.Id == reservationId);

        if (reservation == null)
            return null;

        if (!reservation.CheckInAt.HasValue)
            return null;

        var endTime = reservation.CheckOutAt ?? DateTime.UtcNow;
        return (int)(endTime - reservation.CheckInAt.Value).TotalMinutes;
    }
}
