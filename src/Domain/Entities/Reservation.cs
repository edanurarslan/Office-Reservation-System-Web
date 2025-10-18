using OfisYonetimSistemi.Domain.Common;
using OfisYonetimSistemi.Domain.Enums;

namespace OfisYonetimSistemi.Domain.Entities;

public class Reservation : BaseEntity
{
    public Guid UserId { get; set; }
    public ResourceType ResourceType { get; set; }
    public Guid ResourceId { get; set; } // DeskId or RoomId
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public string? Notes { get; set; }
    public string? Purpose { get; set; }
    public int? ExpectedAttendees { get; set; } // For room reservations
    public DateTime? CheckInAt { get; set; }
    public DateTime? CheckOutAt { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime? CancelledAt { get; set; }
    public bool IsRecurring { get; set; } = false;
    public string? RecurrencePattern { get; set; } // JSON for recurring rules
    public Guid? ParentReservationId { get; set; } // For recurring reservations
    
    // Navigation properties
    public User User { get; set; } = null!;
    public Desk? Desk { get; set; }
    public Room? Room { get; set; }
    public Reservation? ParentReservation { get; set; }
    public ICollection<Reservation> ChildReservations { get; set; } = new List<Reservation>();
    public ICollection<CheckIn> CheckIns { get; set; } = new List<CheckIn>();
}