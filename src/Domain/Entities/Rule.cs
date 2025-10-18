using OfisYonetimSistemi.Domain.Common;
using OfisYonetimSistemi.Domain.Enums;

namespace OfisYonetimSistemi.Domain.Entities;

public class Rule : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public RuleType Type { get; set; }
    public bool IsActive { get; set; } = true;
    public string Configuration { get; set; } = string.Empty; // JSON configuration
    public int Priority { get; set; } = 1; // Higher number = higher priority
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
    public Guid? LocationId { get; set; } // Null means global rule
    public string? TargetResource { get; set; } // "desk", "room", "zone", etc.
    public Guid? TargetResourceId { get; set; }
    
    // Examples of Configuration JSON:
    // Capacity rule: {"maxReservationsPerDay": 2, "maxDurationHours": 8}
    // NoShow rule: {"toleranceMinutes": 15, "penaltyDays": 1}
    // Working hours: {"startTime": "08:00", "endTime": "18:00", "daysOfWeek": [1,2,3,4,5]}
    
    // Navigation properties
    public Location? Location { get; set; }
}