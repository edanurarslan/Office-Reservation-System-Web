using FluentValidation;
using OfisYonetimSistemi.Application.DTOs;

namespace OfisYonetimSistemi.Application.Validators;

/// <summary>
/// Validator for floor plan uploads
/// </summary>
public class FloorPlanUploadValidator : AbstractValidator<FloorPlanUploadDto>
{
    // Allowed file types: images and PDF
    private static readonly string[] AllowedMimeTypes = 
    {
        "image/png", "image/jpeg", "image/webp", "image/svg+xml", 
        "application/pdf", "image/tiff", "application/vnd.ms-visio.drawing"
    };

    // Maximum file size: 50 MB
    private const long MaxFileSizeBytes = 50 * 1024 * 1024;

    public FloorPlanUploadValidator()
    {
        RuleFor(x => x.FloorId)
            .NotEmpty()
            .WithMessage("Floor ID is required");

        RuleFor(x => x.FileName)
            .NotEmpty()
            .WithMessage("File name is required")
            .MaximumLength(500)
            .WithMessage("File name cannot exceed 500 characters");

        RuleFor(x => x.ContentType)
            .NotEmpty()
            .WithMessage("Content type is required")
            .Must(x => AllowedMimeTypes.Contains(x.ToLower()))
            .WithMessage("File type not allowed. Supported types: PNG, JPEG, WebP, SVG, PDF, TIFF, Visio");

        RuleFor(x => x.FileSize)
            .GreaterThan(0)
            .WithMessage("File size must be greater than 0")
            .LessThanOrEqualTo(MaxFileSizeBytes)
            .WithMessage($"File size cannot exceed 50 MB");

        RuleFor(x => x.FileData)
            .NotEmpty()
            .WithMessage("File data is required")
            .Must(x => x.Length > 0)
            .WithMessage("File is empty");

        RuleFor(x => x.WidthMeters)
            .GreaterThan(0)
            .Unless(x => x.WidthMeters == null)
            .WithMessage("Width must be greater than 0")
            .LessThanOrEqualTo(10000)
            .Unless(x => x.WidthMeters == null)
            .WithMessage("Width is unreasonably large (>10km)");

        RuleFor(x => x.HeightMeters)
            .GreaterThan(0)
            .Unless(x => x.HeightMeters == null)
            .WithMessage("Height must be greater than 0")
            .LessThanOrEqualTo(10000)
            .Unless(x => x.HeightMeters == null)
            .WithMessage("Height is unreasonably large (>10km)");

        RuleFor(x => x.ScaleFactor)
            .GreaterThan(0)
            .Unless(x => x.ScaleFactor == null)
            .WithMessage("Scale factor must be greater than 0");

        RuleFor(x => x)
            .Must(HaveConsistentDimensions)
            .WithMessage("If floor dimensions are provided, both width and height must be specified");
    }

    private static bool HaveConsistentDimensions(FloorPlanUploadDto dto)
    {
        // Either both dimensions provided or neither
        bool hasWidth = dto.WidthMeters.HasValue;
        bool hasHeight = dto.HeightMeters.HasValue;

        return hasWidth == hasHeight;
    }
}

/// <summary>
/// Validator for creating floor plan annotations
/// </summary>
public class CreateFloorPlanAnnotationValidator : AbstractValidator<CreateFloorPlanAnnotationDto>
{
    private static readonly string[] AllowedTypes = 
    { 
        "polygon", "circle", "rectangle", "line", "text", "arrow", "freehand", "point" 
    };

    public CreateFloorPlanAnnotationValidator()
    {
        RuleFor(x => x.FloorPlanId)
            .NotEmpty()
            .WithMessage("Floor plan ID is required");

        RuleFor(x => x.AnnotationType)
            .NotEmpty()
            .WithMessage("Annotation type is required")
            .Must(x => AllowedTypes.Contains(x.ToLower()))
            .WithMessage($"Annotation type must be one of: {string.Join(", ", AllowedTypes)}");

        RuleFor(x => x.Coordinates)
            .NotEmpty()
            .WithMessage("Coordinates are required")
            .Must(ValidateGeoJson)
            .WithMessage("Invalid GeoJSON format for coordinates");

        RuleFor(x => x.Label)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.Label))
            .WithMessage("Label cannot exceed 500 characters");

        RuleFor(x => x.Color)
            .NotEmpty()
            .WithMessage("Color is required")
            .Matches(@"^#[0-9A-Fa-f]{6}$")
            .WithMessage("Color must be in hex format (#RRGGBB)");
    }

    private static bool ValidateGeoJson(string coordinates)
    {
        try
        {
            // Basic validation: should be valid JSON
            var json = System.Text.Json.JsonDocument.Parse(coordinates);
            return json.RootElement.ValueKind == System.Text.Json.JsonValueKind.Object 
                || json.RootElement.ValueKind == System.Text.Json.JsonValueKind.Array;
        }
        catch
        {
            return false;
        }
    }
}

/// <summary>
/// Validator for setting active floor plan
/// </summary>
public class SetActiveFloorPlanValidator : AbstractValidator<SetActiveFloorPlanDto>
{
    public SetActiveFloorPlanValidator()
    {
        RuleFor(x => x.FloorPlanId)
            .NotEmpty()
            .WithMessage("Floor plan ID is required");
    }
}

/// <summary>
/// Validator for floor plan list queries
/// </summary>
public class FloorPlanQueryValidator : AbstractValidator<FloorPlanQueryDto>
{
    public FloorPlanQueryValidator()
    {
        RuleFor(x => x.FloorId)
            .NotEmpty()
            .Unless(x => x.FloorId == null)
            .WithMessage("If floor ID is provided, it must be valid");

        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1)
            .WithMessage("Page number must be at least 1");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1)
            .WithMessage("Page size must be at least 1")
            .LessThanOrEqualTo(100)
            .WithMessage("Page size cannot exceed 100");
    }
}

/// <summary>
/// Query DTO for floor plans
/// </summary>
public class FloorPlanQueryDto
{
    /// <summary>
    /// Filter by floor ID
    /// </summary>
    public Guid? FloorId { get; set; }

    /// <summary>
    /// Only show active plans
    /// </summary>
    public bool? OnlyActive { get; set; }

    /// <summary>
    /// Page number (default: 1)
    /// </summary>
    public int PageNumber { get; set; } = 1;

    /// <summary>
    /// Page size (default: 10)
    /// </summary>
    public int PageSize { get; set; } = 10;

    /// <summary>
    /// Sort by (UploadedAt, FileName, FileSize)
    /// </summary>
    public string SortBy { get; set; } = "UploadedAt";

    /// <summary>
    /// Sort descending
    /// </summary>
    public bool SortDescending { get; set; } = true;
}
