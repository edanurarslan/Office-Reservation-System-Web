using OfisYonetimSistemi.Domain.Common;
using OfisYonetimSistemi.Domain.Enums;

namespace OfisYonetimSistemi.Domain.Entities;

public class ApprovalRequest : BaseEntity
{
    public Guid RequesterId { get; set; }
    public ApprovalRequestType RequestType { get; set; }
    public ApprovalStatus Status { get; set; } = ApprovalStatus.Pending;
    public string? Description { get; set; }
    public string? RequestData { get; set; } // JSON data for the request details
    public Guid? RelatedEntityId { get; set; } // Reference to reservation, user, location, etc.
    public string? RelatedEntityType { get; set; } // "Reservation", "User", "Location"
    public Guid? ReviewerId { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewNotes { get; set; }
    public string? RejectionReason { get; set; }

    // Navigation properties
    public User Requester { get; set; } = null!;
    public User? Reviewer { get; set; }
}
