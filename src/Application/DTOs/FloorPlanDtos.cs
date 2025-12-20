namespace OfisYonetimSistemi.Application.DTOs;

/// <summary>
/// Request DTO for floor plan upload
/// </summary>
public class FloorPlanUploadDto
{
    /// <summary>
    /// Floor ID (required)
    /// </summary>
    public Guid FloorId { get; set; }

    /// <summary>
    /// File name (set automatically from IFormFile)
    /// </summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// File content type
    /// </summary>
    public string ContentType { get; set; } = string.Empty;

    /// <summary>
    /// File size in bytes
    /// </summary>
    public long FileSize { get; set; }

    /// <summary>
    /// Floor width in meters (optional)
    /// </summary>
    public decimal? WidthMeters { get; set; }

    /// <summary>
    /// Floor height in meters (optional)
    /// </summary>
    public decimal? HeightMeters { get; set; }

    /// <summary>
    /// Scale factor (pixels per meter)
    /// </summary>
    public decimal? ScaleFactor { get; set; }

    /// <summary>
    /// Should this be set as active floor plan
    /// </summary>
    public bool SetAsActive { get; set; } = true;

    /// <summary>
    /// File binary data (populated from IFormFile)
    /// </summary>
    public byte[] FileData { get; set; } = [];
}

/// <summary>
/// Response DTO for floor plan
/// </summary>
public class FloorPlanDto
{
    /// <summary>
    /// Floor plan ID
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Floor ID
    /// </summary>
    public Guid FloorId { get; set; }

    /// <summary>
    /// File name
    /// </summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// File path/URL
    /// </summary>
    public string FilePath { get; set; } = string.Empty;

    /// <summary>
    /// Content type
    /// </summary>
    public string ContentType { get; set; } = string.Empty;

    /// <summary>
    /// File size in bytes
    /// </summary>
    public long FileSize { get; set; }

    /// <summary>
    /// Upload timestamp
    /// </summary>
    public DateTime UploadedAt { get; set; }

    /// <summary>
    /// Uploaded by user name
    /// </summary>
    public string UploadedByName { get; set; } = string.Empty;

    /// <summary>
    /// Floor width in meters
    /// </summary>
    public decimal? WidthMeters { get; set; }

    /// <summary>
    /// Floor height in meters
    /// </summary>
    public decimal? HeightMeters { get; set; }

    /// <summary>
    /// Image width in pixels
    /// </summary>
    public int? ImageWidth { get; set; }

    /// <summary>
    /// Image height in pixels
    /// </summary>
    public int? ImageHeight { get; set; }

    /// <summary>
    /// Scale factor
    /// </summary>
    public decimal? ScaleFactor { get; set; }

    /// <summary>
    /// Is active floor plan
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Annotations on this plan
    /// </summary>
    public List<FloorPlanAnnotationDto> Annotations { get; set; } = [];
}

/// <summary>
/// Floor plan annotation DTO
/// </summary>
public class FloorPlanAnnotationDto
{
    /// <summary>
    /// Annotation ID
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Annotation type (polygon, circle, etc.)
    /// </summary>
    public string AnnotationType { get; set; } = string.Empty;

    /// <summary>
    /// Coordinates as GeoJSON
    /// </summary>
    public string Coordinates { get; set; } = string.Empty;

    /// <summary>
    /// Label
    /// </summary>
    public string? Label { get; set; }

    /// <summary>
    /// Color in hex
    /// </summary>
    public string Color { get; set; } = "#000000";

    /// <summary>
    /// Created by user
    /// </summary>
    public string CreatedByName { get; set; } = string.Empty;

    /// <summary>
    /// Creation timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Request to add annotation to floor plan
/// </summary>
public class CreateFloorPlanAnnotationDto
{
    /// <summary>
    /// Floor plan ID
    /// </summary>
    public Guid FloorPlanId { get; set; }

    /// <summary>
    /// Annotation type
    /// </summary>
    public string AnnotationType { get; set; } = string.Empty;

    /// <summary>
    /// Coordinates (GeoJSON format)
    /// </summary>
    public string Coordinates { get; set; } = string.Empty;

    /// <summary>
    /// Label
    /// </summary>
    public string? Label { get; set; }

    /// <summary>
    /// Color
    /// </summary>
    public string Color { get; set; } = "#000000";
}

/// <summary>
/// Request to set floor plan as active
/// </summary>
public class SetActiveFloorPlanDto
{
    /// <summary>
    /// Floor plan ID to activate
    /// </summary>
    public Guid FloorPlanId { get; set; }
}

/// <summary>
/// Floor plan summary (lightweight list response)
/// </summary>
public class FloorPlanSummaryDto
{
    /// <summary>
    /// Floor plan ID
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// File name
    /// </summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// Upload timestamp
    /// </summary>
    public DateTime UploadedAt { get; set; }

    /// <summary>
    /// Is active
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Uploaded by
    /// </summary>
    public string UploadedByName { get; set; } = string.Empty;

    /// <summary>
    /// File size in bytes
    /// </summary>
    public long FileSize { get; set; }
}
