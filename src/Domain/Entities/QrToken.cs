using OfisYonetimSistemi.Domain.Common;
using OfisYonetimSistemi.Domain.Enums;

namespace OfisYonetimSistemi.Domain.Entities;

public class QrToken : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid? ReservationId { get; set; }
    public string TokenHash { get; set; } = string.Empty; // bcrypt hash of the actual token
    public QrTokenStatus Status { get; set; } = QrTokenStatus.Active;
    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public string Purpose { get; set; } = "checkin"; // "checkin", "checkout", "access"
    public string? DeviceInfo { get; set; } // Device that generated the token
    public string? LocationRestriction { get; set; } // Optional location restriction
    
    // Navigation properties
    public User User { get; set; } = null!;
    public Reservation? Reservation { get; set; }
}