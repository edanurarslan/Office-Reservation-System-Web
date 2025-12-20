using OfisYonetimSistemi.Domain.Common;
using OfisYonetimSistemi.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
    
    // Task 3: Rules engine enhancements
    [StringLength(50)]
    public string RuleType { get; set; } = string.Empty;

    [StringLength(50)]
    public string Scope { get; set; } = "Global";

    public Guid? TargetId { get; set; }

    public int AppliedCount { get; set; } = 0;

    public DateTime? LastAppliedAt { get; set; }

    [Required]
    public Guid CreatedByUserId { get; set; }
    
    // Examples of Configuration JSON:
    // Capacity rule: {"maxReservationsPerDay": 2, "maxDurationHours": 8}
    // NoShow rule: {"toleranceMinutes": 15, "penaltyDays": 1}
    // Working hours: {"startTime": "08:00", "endTime": "18:00", "daysOfWeek": [1,2,3,4,5]}
    
    // Navigation properties
    public Location? Location { get; set; }

    [ForeignKey(nameof(CreatedByUserId))]
    public virtual User? CreatedByUser { get; set; }

    public virtual ICollection<RuleAuditLog> AuditLogs { get; set; } = [];
}

/// <summary>
/// Audit log for rule applications (Task 3)
/// </summary>
[Table("RuleAuditLogs")]
public class RuleAuditLog : BaseEntity
{
    /// <summary>
    /// Rule ID
    /// </summary>
    [Required]
    public Guid RuleId { get; set; }

    /// <summary>
    /// When the rule was applied
    /// </summary>
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Context of application (JSON)
    /// </summary>
    [Required]
    public string ContextData { get; set; } = string.Empty;

    /// <summary>
    /// Result of rule application
    /// </summary>
    [StringLength(1000)]
    public string? Result { get; set; }

    // Navigation
    [ForeignKey(nameof(RuleId))]
    public virtual Rule? Rule { get; set; }
}