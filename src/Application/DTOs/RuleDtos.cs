using System.Text.Json;
using System.Text.RegularExpressions;

namespace OfisYonetimSistemi.Application.DTOs;

/// <summary>
/// Rule creation/update DTO
/// </summary>
public class RuleDto
{
    /// <summary>
    /// Rule ID
    /// </summary>
    public Guid? Id { get; set; }

    /// <summary>
    /// Rule name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Rule description
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Rule type (Pricing, Availability, NoShow, Capacity, Notification)
    /// </summary>
    public string RuleType { get; set; } = string.Empty;

    /// <summary>
    /// Priority (0-100, lower = higher priority)
    /// </summary>
    public int Priority { get; set; } = 50;

    /// <summary>
    /// Is active
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Rule DSL as JSON
    /// </summary>
    public RuleDslDto RuleDsl { get; set; } = new();

    /// <summary>
    /// Scope (Global, Location, Floor, Zone, Resource)
    /// </summary>
    public string Scope { get; set; } = "Global";

    /// <summary>
    /// Target ID based on scope
    /// </summary>
    public Guid? TargetId { get; set; }

    /// <summary>
    /// Effective from date
    /// </summary>
    public DateTime? EffectiveFrom { get; set; }

    /// <summary>
    /// Effective to date
    /// </summary>
    public DateTime? EffectiveTo { get; set; }

    /// <summary>
    /// Applied count
    /// </summary>
    public int AppliedCount { get; set; }

    /// <summary>
    /// Last applied timestamp
    /// </summary>
    public DateTime? LastAppliedAt { get; set; }

    /// <summary>
    /// Created by user
    /// </summary>
    public string? CreatedByUser { get; set; }
}

/// <summary>
/// Rule DSL (Domain Specific Language) definition
/// </summary>
public class RuleDslDto
{
    /// <summary>
    /// Condition expression (free-form or structured)
    /// Examples:
    /// - "time.hour >= 9 AND time.hour <= 11"
    /// - "reservation.duration > 8"
    /// - "occupancy.percentage > 80"
    /// </summary>
    public string? Condition { get; set; }

    /// <summary>
    /// Action to take (apply_surcharge, restrict_booking, mark_unavailable, send_notification)
    /// </summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// Action parameters (JSON object)
    /// Examples:
    /// For apply_surcharge: {"percentage": 20, "flatAmount": 10, "currency": "TRY"}
    /// For send_notification: {"template": "peak_hours", "recipients": ["email", "sms"]}
    /// For mark_unavailable: {"reason": "maintenance"}
    /// </summary>
    public Dictionary<string, object> Parameters { get; set; } = [];

    /// <summary>
    /// Trigger events (optional, for event-based rules)
    /// Examples: "on_reservation_created", "on_check_in", "on_check_out", "on_schedule"
    /// </summary>
    public List<string> Triggers { get; set; } = [];
}

/// <summary>
/// Rule evaluation context
/// </summary>
public class RuleEvaluationContext
{
    /// <summary>
    /// Current time
    /// </summary>
    public DateTime CurrentTime { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Reservation being evaluated
    /// </summary>
    public Guid? ReservationId { get; set; }

    /// <summary>
    /// Resource being evaluated (Desk or Room)
    /// </summary>
    public Guid? ResourceId { get; set; }

    /// <summary>
    /// Current occupancy percentage (0-100)
    /// </summary>
    public decimal OccupancyPercentage { get; set; }

    /// <summary>
    /// Location ID
    /// </summary>
    public Guid? LocationId { get; set; }

    /// <summary>
    /// Custom context data
    /// </summary>
    public Dictionary<string, object> CustomData { get; set; } = [];
}

/// <summary>
/// Rule evaluation result
/// </summary>
public class RuleEvaluationResult
{
    /// <summary>
    /// Whether condition was met
    /// </summary>
    public bool ConditionMet { get; set; }

    /// <summary>
    /// Action to apply if condition met
    /// </summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// Action parameters
    /// </summary>
    public Dictionary<string, object> Parameters { get; set; } = [];

    /// <summary>
    /// Rule ID that matched
    /// </summary>
    public Guid RuleId { get; set; }

    /// <summary>
    /// Rule name
    /// </summary>
    public string RuleName { get; set; } = string.Empty;

    /// <summary>
    /// Rule priority
    /// </summary>
    public int Priority { get; set; }
}

/// <summary>
/// Batch rule evaluation result
/// </summary>
public class BatchRuleEvaluationResult
{
    /// <summary>
    /// Applied rules in priority order
    /// </summary>
    public List<RuleEvaluationResult> AppliedRules { get; set; } = [];

    /// <summary>
    /// Total impact (composite of all rule actions)
    /// </summary>
    public Dictionary<string, object> TotalImpact { get; set; } = [];

    /// <summary>
    /// Evaluation timestamp
    /// </summary>
    public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Rule list query DTO
/// </summary>
public class RuleListQueryDto
{
    /// <summary>
    /// Filter by type
    /// </summary>
    public string? RuleType { get; set; }

    /// <summary>
    /// Filter by scope
    /// </summary>
    public string? Scope { get; set; }

    /// <summary>
    /// Only active rules
    /// </summary>
    public bool? OnlyActive { get; set; }

    /// <summary>
    /// Page number
    /// </summary>
    public int PageNumber { get; set; } = 1;

    /// <summary>
    /// Page size
    /// </summary>
    public int PageSize { get; set; } = 20;

    /// <summary>
    /// Sort by
    /// </summary>
    public string SortBy { get; set; } = "Priority";

    /// <summary>
    /// Sort descending
    /// </summary>
    public bool SortDescending { get; set; }
}
