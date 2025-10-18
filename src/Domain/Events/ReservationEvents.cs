using OfisYonetimSistemi.Domain.Common;

namespace OfisYonetimSistemi.Domain.Events;

public class ReservationCreatedEvent : DomainEvent
{
    public Guid ReservationId { get; }
    public Guid UserId { get; }
    public DateTime StartsAt { get; }
    public DateTime EndsAt { get; }

    public ReservationCreatedEvent(Guid reservationId, Guid userId, DateTime startsAt, DateTime endsAt)
    {
        ReservationId = reservationId;
        UserId = userId;
        StartsAt = startsAt;
        EndsAt = endsAt;
    }
}

public class ReservationCancelledEvent : DomainEvent
{
    public Guid ReservationId { get; }
    public Guid UserId { get; }
    public string? Reason { get; }

    public ReservationCancelledEvent(Guid reservationId, Guid userId, string? reason = null)
    {
        ReservationId = reservationId;
        UserId = userId;
        Reason = reason;
    }
}

public class UserCheckedInEvent : DomainEvent
{
    public Guid UserId { get; }
    public Guid? ReservationId { get; }
    public DateTime CheckInTime { get; }

    public UserCheckedInEvent(Guid userId, Guid? reservationId, DateTime checkInTime)
    {
        UserId = userId;
        ReservationId = reservationId;
        CheckInTime = checkInTime;
    }
}