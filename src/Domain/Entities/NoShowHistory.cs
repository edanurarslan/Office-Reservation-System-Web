using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OfisYonetimSistemi.Domain.Common;

namespace OfisYonetimSistemi.Domain.Entities;

/// <summary>
/// Track no-show instances for users (Task 4)
/// </summary>
[Table("NoShowHistories")]
public class NoShowHistory : BaseEntity
{
    /// <summary>
    /// Reservation that resulted in no-show
    /// </summary>
    [Required]
    public Guid ReservationId { get; set; }

    /// <summary>
    /// User who did not show up
    /// </summary>
    [Required]
    public Guid UserId { get; set; }

    /// <summary>
    /// Resource that was reserved (DeskId or RoomId)
    /// </summary>
    [Required]
    public Guid ResourceId { get; set; }

    /// <summary>
    /// Resource type (Desk or Room)
    /// </summary>
    [Required]
    [StringLength(50)]
    public string ResourceType { get; set; } = string.Empty;

    /// <summary>
    /// Location ID
    /// </summary>
    [Required]
    public Guid LocationId { get; set; }

    /// <summary>
    /// Scheduled check-in time
    /// </summary>
    public DateTime ScheduledStartTime { get; set; }

    /// <summary>
    /// Timestamp when no-show was detected
    /// </summary>
    public DateTime DetectedAt { get; set; }

    /// <summary>
    /// Grace period (how many minutes late before marking as no-show)
    /// </summary>
    public int GracePeriodMinutes { get; set; } = 15;

    /// <summary>
    /// Penalty applied (description)
    /// </summary>
    [StringLength(500)]
    public string? PenaltyApplied { get; set; }

    /// <summary>
    /// User's no-show count for this month
    /// </summary>
    public int MonthlyCount { get; set; } = 1;

    /// <summary>
    /// Is penalty waived (admin override)
    /// </summary>
    public bool IsPenaltyWaived { get; set; }

    /// <summary>
    /// Waiver reason if applicable
    /// </summary>
    [StringLength(500)]
    public string? WaiverReason { get; set; }

    /// <summary>
    /// Waived by user ID
    /// </summary>
    public Guid? WaivedByUserId { get; set; }

    /// <summary>
    /// Is deleted (soft delete)
    /// </summary>
    public DateTime? WaivedAt { get; set; }

    // Navigation
    /// <summary>
    /// Reservation that was missed
    /// </summary>
    [ForeignKey(nameof(ReservationId))]
    public virtual Reservation? Reservation { get; set; }

    /// <summary>
    /// User who had no-show
    /// </summary>
    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    /// <summary>
    /// Location of resource
    /// </summary>
    [ForeignKey(nameof(LocationId))]
    public virtual Location? Location { get; set; }

    /// <summary>
    /// Admin who waived penalty
    /// </summary>
    [ForeignKey(nameof(WaivedByUserId))]
    public virtual User? WaivedByUser { get; set; }
}
