using OfisYonetimSistemi.Domain.Common;
using OfisYonetimSistemi.Domain.Enums;

namespace OfisYonetimSistemi.Domain.Entities;

public class CheckIn : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid? ReservationId { get; set; }
    public CheckInType Type { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? QrTokenUsed { get; set; }
    public string? DeviceInfo { get; set; } // Scanner device information
    public string? LocationInfo { get; set; } // GPS or location details
    public string? Notes { get; set; }
    
    // Navigation properties
    public User User { get; set; } = null!;
    public Reservation? Reservation { get; set; }
}