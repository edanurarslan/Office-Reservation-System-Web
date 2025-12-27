using OfisYonetimSistemi.Domain.Common;

namespace OfisYonetimSistemi.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "info"; // "info", "warning", "error", "success"
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
    public Guid? SenderId { get; set; }
    public string? RelatedEntityType { get; set; } // "Reservation", "Rule", etc.
    public Guid? RelatedEntityId { get; set; }
    
    // Navigation properties
    public User User { get; set; } = null!;
    public User? Sender { get; set; }
}
