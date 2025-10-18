using OfisYonetimSistemi.Domain.Common;

namespace OfisYonetimSistemi.Domain.Entities;

public class AuditLog : BaseEntity
{
    public Guid? UserId { get; set; }
    public string Action { get; set; } = string.Empty; // "CREATE", "UPDATE", "DELETE", "LOGIN", etc.
    public string EntityType { get; set; } = string.Empty; // "Reservation", "User", "Desk", etc.
    public Guid? EntityId { get; set; }
    public string? OldValues { get; set; } // JSON of old values
    public string? NewValues { get; set; } // JSON of new values
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? SessionId { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? AdditionalData { get; set; } // JSON for extra context
    
    // Navigation properties
    public User? User { get; set; }
}