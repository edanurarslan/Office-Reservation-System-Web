using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OfisYonetimSistemi.Domain.Common;

namespace OfisYonetimSistemi.Domain.Entities;

/// <summary>
/// Floor Plan entity for storing uploaded floor plans with metadata
/// </summary>
[Table("FloorPlans")]
public class FloorPlan : BaseEntity
{
    /// <summary>
    /// Floor this plan is for (required)
    /// </summary>
    [Required]
    public Guid FloorId { get; set; }

    /// <summary>
    /// File name as uploaded
    /// </summary>
    [Required]
    [StringLength(500)]
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// Unique file path in storage (S3/local)
    /// </summary>
    [Required]
    [StringLength(1000)]
    public string FilePath { get; set; } = string.Empty;

    /// <summary>
    /// MIME type (image/png, image/jpeg, application/pdf, etc.)
    /// </summary>
    [Required]
    [StringLength(100)]
    public string ContentType { get; set; } = string.Empty;

    /// <summary>
    /// File size in bytes
    /// </summary>
    public long FileSize { get; set; }

    /// <summary>
    /// Upload timestamp
    /// </summary>
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// User ID who uploaded
    /// </summary>
    [Required]
    public Guid UploadedBy { get; set; }

    /// <summary>
    /// Floor dimension width in meters (optional)
    /// </summary>
    public decimal? WidthMeters { get; set; }

    /// <summary>
    /// Floor dimension height in meters (optional)
    /// </summary>
    public decimal? HeightMeters { get; set; }

    /// <summary>
    /// Image width in pixels (for raster formats)
    /// </summary>
    public int? ImageWidth { get; set; }

    /// <summary>
    /// Image height in pixels (for raster formats)
    /// </summary>
    public int? ImageHeight { get; set; }

    /// <summary>
    /// Scale factor (pixels per meter for raster, or DPI for PDF)
    /// </summary>
    public decimal? ScaleFactor { get; set; }

    /// <summary>
    /// Whether this is the active/primary floor plan
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Soft delete flag
    /// </summary>
    public bool IsDeleted { get; set; }

    /// <summary>
    /// Deletion timestamp
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    // Navigation
    /// <summary>
    /// Floor this plan belongs to
    /// </summary>
    [ForeignKey(nameof(FloorId))]
    public virtual Floor? Floor { get; set; }

    /// <summary>
    /// User who uploaded
    /// </summary>
    [ForeignKey(nameof(UploadedBy))]
    public virtual User? UploadedByUser { get; set; }

    /// <summary>
    /// Annotations on this floor plan
    /// </summary>
    public virtual ICollection<FloorPlanAnnotation> Annotations { get; set; } = [];
}

/// <summary>
/// Annotation for markups on floor plans
/// </summary>
[Table("FloorPlanAnnotations")]
public class FloorPlanAnnotation : BaseEntity
{
    /// <summary>
    /// Floor plan this annotation belongs to
    /// </summary>
    [Required]
    public Guid FloorPlanId { get; set; }

    /// <summary>
    /// Annotation type (polygon, circle, rectangle, line, text, etc.)
    /// </summary>
    [Required]
    [StringLength(50)]
    public string AnnotationType { get; set; } = string.Empty;

    /// <summary>
    /// GeoJSON coordinates as string
    /// </summary>
    [Required]
    public string Coordinates { get; set; } = string.Empty;

    /// <summary>
    /// Label or description
    /// </summary>
    [StringLength(500)]
    public string? Label { get; set; }

    /// <summary>
    /// Color in hex format (#FF0000)
    /// </summary>
    [StringLength(7)]
    public string Color { get; set; } = "#000000";

    /// <summary>
    /// Created by user ID
    /// </summary>
    [Required]
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Is deleted (soft delete)
    /// </summary>
    public bool IsDeleted { get; set; }

    // Navigation
    /// <summary>
    /// Floor plan being annotated
    /// </summary>
    [ForeignKey(nameof(FloorPlanId))]
    public virtual FloorPlan? FloorPlan { get; set; }

    /// <summary>
    /// User who created annotation
    /// </summary>
    [ForeignKey(nameof(CreatedByUserId))]
    public virtual User? CreatedByUser { get; set; }
}
