using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OfisYonetimSistemi.Application.DTOs;
using OfisYonetimSistemi.Domain.Entities;
using OfisYonetimSistemi.Infrastructure.Data;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace OfisYonetimSistemi.Infrastructure.Services;

/// <summary>
/// Interface for floor plan operations
/// </summary>
public interface IFloorPlanService
{
    /// <summary>
    /// Upload a new floor plan
    /// </summary>
    Task<FloorPlanDto> UploadFloorPlanAsync(FloorPlanUploadDto dto, Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get floor plan by ID
    /// </summary>
    Task<FloorPlanDto?> GetFloorPlanAsync(Guid floorPlanId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all floor plans for a floor
    /// </summary>
    Task<List<FloorPlanSummaryDto>> GetFloorPlansAsync(Guid floorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get active floor plan for a floor
    /// </summary>
    Task<FloorPlanDto?> GetActiveFloorPlanAsync(Guid floorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Set a floor plan as active
    /// </summary>
    Task<FloorPlanDto> SetActiveFloorPlanAsync(Guid floorPlanId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete floor plan
    /// </summary>
    Task DeleteFloorPlanAsync(Guid floorPlanId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Add annotation to floor plan
    /// </summary>
    Task<FloorPlanAnnotationDto> AddAnnotationAsync(CreateFloorPlanAnnotationDto dto, Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete annotation
    /// </summary>
    Task DeleteAnnotationAsync(Guid annotationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get floor plan file content
    /// </summary>
    Task<(byte[] Content, string ContentType, string FileName)> GetFloorPlanFileAsync(Guid floorPlanId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Floor plan service implementation
/// </summary>
public class FloorPlanService : IFloorPlanService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FloorPlanService> _logger;
    private readonly IFileStorageService _fileStorage;

    // Base directory for floor plan storage
    private const string FloorPlanStorageDirectory = "floor-plans";

    // Maximum concurrent uploads per floor
    private const int MaxConcurrentUploads = 5;

    public FloorPlanService(
        ApplicationDbContext context,
        ILogger<FloorPlanService> logger,
        IFileStorageService fileStorage)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _fileStorage = fileStorage ?? throw new ArgumentNullException(nameof(fileStorage));
    }

    public async Task<FloorPlanDto> UploadFloorPlanAsync(FloorPlanUploadDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            // Verify floor exists
            var floor = await _context.Floors.FindAsync(new object[] { dto.FloorId }, cancellationToken: cancellationToken);
            if (floor == null)
                throw new KeyNotFoundException($"Floor {dto.FloorId} not found");

            // Check concurrent uploads
            var recentUploads = await _context.FloorPlans
                .Where(fp => fp.FloorId == dto.FloorId && !fp.IsDeleted)
                .CountAsync(cancellationToken);

            if (recentUploads >= MaxConcurrentUploads)
                throw new InvalidOperationException($"Maximum floor plans ({MaxConcurrentUploads}) reached for this floor");

            // Generate unique file path
            var filePath = GenerateFilePath(dto.FileName);

            // Save file to storage
            await _fileStorage.SaveFileAsync(filePath, dto.FileData, cancellationToken);

            // Create entity
            var floorPlan = new FloorPlan
            {
                FloorId = dto.FloorId,
                FileName = dto.FileName,
                FilePath = filePath,
                ContentType = dto.ContentType,
                FileSize = dto.FileSize,
                UploadedBy = userId,
                UploadedAt = DateTime.UtcNow,
                WidthMeters = dto.WidthMeters,
                HeightMeters = dto.HeightMeters,
                ScaleFactor = dto.ScaleFactor,
                IsActive = dto.SetAsActive
            };

            // Extract image dimensions if applicable
            if (IsImageFile(dto.ContentType))
            {
                var (width, height) = ExtractImageDimensions(dto.FileData);
                floorPlan.ImageWidth = width;
                floorPlan.ImageHeight = height;
            }

            // If setting as active, deactivate others
            if (dto.SetAsActive)
            {
                var activePlans = await _context.FloorPlans
                    .Where(fp => fp.FloorId == dto.FloorId && fp.IsActive && !fp.IsDeleted)
                    .ToListAsync(cancellationToken);

                foreach (var plan in activePlans)
                {
                    plan.IsActive = false;
                }
            }

            _context.FloorPlans.Add(floorPlan);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Floor plan uploaded for floor {FloorId} by user {UserId}", dto.FloorId, userId);

            return MapToDto(floorPlan, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading floor plan for floor {FloorId}", dto.FloorId);
            throw;
        }
    }

    public async Task<FloorPlanDto?> GetFloorPlanAsync(Guid floorPlanId, CancellationToken cancellationToken = default)
    {
        try
        {
            var floorPlan = await _context.FloorPlans
                .AsNoTracking()
                .Include(fp => fp.UploadedByUser)
                .Include(fp => fp.Annotations!)
                    .ThenInclude(a => a.CreatedByUser)
                .Where(fp => fp.Id == floorPlanId && !fp.IsDeleted)
                .FirstOrDefaultAsync(cancellationToken);

            return floorPlan != null ? MapToDto(floorPlan, floorPlan.Annotations) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving floor plan {FloorPlanId}", floorPlanId);
            throw;
        }
    }

    public async Task<List<FloorPlanSummaryDto>> GetFloorPlansAsync(Guid floorId, CancellationToken cancellationToken = default)
    {
        try
        {
            var floorPlans = await _context.FloorPlans
                .AsNoTracking()
                .Include(fp => fp.UploadedByUser)
                .Where(fp => fp.FloorId == floorId && !fp.IsDeleted)
                .OrderByDescending(fp => fp.UploadedAt)
                .ToListAsync(cancellationToken);

            return floorPlans.Select(fp => new FloorPlanSummaryDto
            {
                Id = fp.Id,
                FileName = fp.FileName,
                UploadedAt = fp.UploadedAt,
                IsActive = fp.IsActive,
                UploadedByName = fp.UploadedByUser?.FirstName + " " + fp.UploadedByUser?.LastName ?? "Unknown",
                FileSize = fp.FileSize
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving floor plans for floor {FloorId}", floorId);
            throw;
        }
    }

    public async Task<FloorPlanDto?> GetActiveFloorPlanAsync(Guid floorId, CancellationToken cancellationToken = default)
    {
        try
        {
            var floorPlan = await _context.FloorPlans
                .AsNoTracking()
                .Include(fp => fp.UploadedByUser)
                .Include(fp => fp.Annotations!)
                    .ThenInclude(a => a.CreatedByUser)
                .Where(fp => fp.FloorId == floorId && fp.IsActive && !fp.IsDeleted)
                .FirstOrDefaultAsync(cancellationToken);

            return floorPlan != null ? MapToDto(floorPlan, floorPlan.Annotations) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active floor plan for floor {FloorId}", floorId);
            throw;
        }
    }

    public async Task<FloorPlanDto> SetActiveFloorPlanAsync(Guid floorPlanId, CancellationToken cancellationToken = default)
    {
        try
        {
            var floorPlan = await _context.FloorPlans
                .Include(fp => fp.Annotations)
                .FirstOrDefaultAsync(fp => fp.Id == floorPlanId && !fp.IsDeleted, cancellationToken);

            if (floorPlan == null)
                throw new KeyNotFoundException($"Floor plan {floorPlanId} not found");

            // Deactivate others for same floor
            var otherPlans = await _context.FloorPlans
                .Where(fp => fp.FloorId == floorPlan.FloorId && fp.IsActive && !fp.IsDeleted && fp.Id != floorPlanId)
                .ToListAsync(cancellationToken);

            foreach (var plan in otherPlans)
            {
                plan.IsActive = false;
            }

            floorPlan.IsActive = true;
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Floor plan {FloorPlanId} set as active", floorPlanId);

            return MapToDto(floorPlan, floorPlan.Annotations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting active floor plan {FloorPlanId}", floorPlanId);
            throw;
        }
    }

    public async Task DeleteFloorPlanAsync(Guid floorPlanId, CancellationToken cancellationToken = default)
    {
        try
        {
            var floorPlan = await _context.FloorPlans.FindAsync(new object[] { floorPlanId }, cancellationToken: cancellationToken);
            if (floorPlan == null || floorPlan.IsDeleted)
                throw new KeyNotFoundException($"Floor plan {floorPlanId} not found");

            // Soft delete
            floorPlan.IsDeleted = true;
            floorPlan.DeletedAt = DateTime.UtcNow;

            // Also soft delete annotations
            var annotations = await _context.FloorPlanAnnotations
                .Where(a => a.FloorPlanId == floorPlanId && !a.IsDeleted)
                .ToListAsync(cancellationToken);

            foreach (var annotation in annotations)
            {
                annotation.IsDeleted = true;
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Floor plan {FloorPlanId} deleted", floorPlanId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting floor plan {FloorPlanId}", floorPlanId);
            throw;
        }
    }

    public async Task<FloorPlanAnnotationDto> AddAnnotationAsync(CreateFloorPlanAnnotationDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var floorPlan = await _context.FloorPlans
                .FindAsync(new object[] { dto.FloorPlanId }, cancellationToken: cancellationToken);

            if (floorPlan == null || floorPlan.IsDeleted)
                throw new KeyNotFoundException($"Floor plan {dto.FloorPlanId} not found");

            var annotation = new FloorPlanAnnotation
            {
                FloorPlanId = dto.FloorPlanId,
                AnnotationType = dto.AnnotationType,
                Coordinates = dto.Coordinates,
                Label = dto.Label,
                Color = dto.Color,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.FloorPlanAnnotations.Add(annotation);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Annotation added to floor plan {FloorPlanId}", dto.FloorPlanId);

            var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken: cancellationToken);
            return new FloorPlanAnnotationDto
            {
                Id = annotation.Id,
                AnnotationType = annotation.AnnotationType,
                Coordinates = annotation.Coordinates,
                Label = annotation.Label,
                Color = annotation.Color,
                CreatedByName = user?.FirstName + " " + user?.LastName ?? "Unknown",
                CreatedAt = annotation.CreatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding annotation to floor plan {FloorPlanId}", dto.FloorPlanId);
            throw;
        }
    }

    public async Task DeleteAnnotationAsync(Guid annotationId, CancellationToken cancellationToken = default)
    {
        try
        {
            var annotation = await _context.FloorPlanAnnotations.FindAsync(new object[] { annotationId }, cancellationToken: cancellationToken);
            if (annotation == null || annotation.IsDeleted)
                throw new KeyNotFoundException($"Annotation {annotationId} not found");

            annotation.IsDeleted = true;
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Annotation {AnnotationId} deleted", annotationId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting annotation {AnnotationId}", annotationId);
            throw;
        }
    }

    public async Task<(byte[] Content, string ContentType, string FileName)> GetFloorPlanFileAsync(Guid floorPlanId, CancellationToken cancellationToken = default)
    {
        try
        {
            var floorPlan = await _context.FloorPlans
                .AsNoTracking()
                .FirstOrDefaultAsync(fp => fp.Id == floorPlanId && !fp.IsDeleted, cancellationToken);

            if (floorPlan == null)
                throw new KeyNotFoundException($"Floor plan {floorPlanId} not found");

            var content = await _fileStorage.GetFileAsync(floorPlan.FilePath, cancellationToken);
            return (content, floorPlan.ContentType, floorPlan.FileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving floor plan file {FloorPlanId}", floorPlanId);
            throw;
        }
    }

    // Helper methods
    private static string GenerateFilePath(string fileName)
    {
        var uniqueName = $"{Guid.NewGuid()}_{Regex.Replace(fileName, @"[^\w\-\.]", "_")}";
        return Path.Combine(FloorPlanStorageDirectory, uniqueName);
    }

    private static bool IsImageFile(string contentType)
    {
        return contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);
    }

    private static (int? Width, int? Height) ExtractImageDimensions(byte[] imageData)
    {
        try
        {
            // Simple PNG/JPEG dimension extraction
            if (imageData.Length < 24) return (null, null);

            // PNG signature: 89 50 4E 47
            if (imageData[0] == 0x89 && imageData[1] == 0x50 && imageData[2] == 0x4E && imageData[3] == 0x47)
            {
                var width = BitConverter.ToInt32(new[] { imageData[19], imageData[18], imageData[17], imageData[16] }, 0);
                var height = BitConverter.ToInt32(new[] { imageData[23], imageData[22], imageData[21], imageData[20] }, 0);
                return (width, height);
            }

            // JPEG signature: FF D8 FF
            if (imageData[0] == 0xFF && imageData[1] == 0xD8 && imageData[2] == 0xFF)
            {
                // For JPEG, dimension extraction is more complex; return null for now
                return (null, null);
            }

            return (null, null);
        }
        catch
        {
            return (null, null);
        }
    }

    private static FloorPlanDto MapToDto(FloorPlan entity, ICollection<FloorPlanAnnotation>? annotations)
    {
        return new FloorPlanDto
        {
            Id = entity.Id,
            FloorId = entity.FloorId,
            FileName = entity.FileName,
            FilePath = entity.FilePath,
            ContentType = entity.ContentType,
            FileSize = entity.FileSize,
            UploadedAt = entity.UploadedAt,
            UploadedByName = entity.UploadedByUser?.FirstName + " " + entity.UploadedByUser?.LastName ?? "Unknown",
            WidthMeters = entity.WidthMeters,
            HeightMeters = entity.HeightMeters,
            ImageWidth = entity.ImageWidth,
            ImageHeight = entity.ImageHeight,
            ScaleFactor = entity.ScaleFactor,
            IsActive = entity.IsActive,
            Annotations = annotations?.Where(a => !a.IsDeleted).Select(a => new FloorPlanAnnotationDto
            {
                Id = a.Id,
                AnnotationType = a.AnnotationType,
                Coordinates = a.Coordinates,
                Label = a.Label,
                Color = a.Color,
                CreatedByName = a.CreatedByUser?.FirstName + " " + a.CreatedByUser?.LastName ?? "Unknown",
                CreatedAt = a.CreatedAt
            }).ToList() ?? []
        };
    }
}

/// <summary>
/// Interface for file storage operations
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Save file to storage
    /// </summary>
    Task SaveFileAsync(string filePath, byte[] content, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get file from storage
    /// </summary>
    Task<byte[]> GetFileAsync(string filePath, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete file from storage
    /// </summary>
    Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if file exists
    /// </summary>
    Task<bool> FileExistsAsync(string filePath, CancellationToken cancellationToken = default);
}

/// <summary>
/// Local file storage implementation
/// </summary>
public class LocalFileStorageService : IFileStorageService
{
    private readonly string _basePath;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(ILogger<LocalFileStorageService> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _basePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        Directory.CreateDirectory(_basePath);
    }

    public async Task SaveFileAsync(string filePath, byte[] content, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullPath = Path.Combine(_basePath, filePath);
            var directory = Path.GetDirectoryName(fullPath);

            if (directory != null)
            {
                Directory.CreateDirectory(directory);
            }

            await File.WriteAllBytesAsync(fullPath, content, cancellationToken);
            _logger.LogInformation("File saved: {FilePath}", filePath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving file: {FilePath}", filePath);
            throw;
        }
    }

    public async Task<byte[]> GetFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullPath = Path.Combine(_basePath, filePath);

            if (!File.Exists(fullPath))
                throw new FileNotFoundException($"File not found: {filePath}");

            return await File.ReadAllBytesAsync(fullPath, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading file: {FilePath}", filePath);
            throw;
        }
    }

    public async Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullPath = Path.Combine(_basePath, filePath);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation("File deleted: {FilePath}", filePath);
            }

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file: {FilePath}", filePath);
            throw;
        }
    }

    public async Task<bool> FileExistsAsync(string filePath, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullPath = Path.Combine(_basePath, filePath);
            return await Task.FromResult(File.Exists(fullPath));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking file: {FilePath}", filePath);
            return false;
        }
    }
}
