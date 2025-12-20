using OfisYonetimSistemi.Application.DTOs;
using OfisYonetimSistemi.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace OfisYonetimSistemi.API.Controllers;

/// <summary>
/// Floor plan management endpoints
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FloorPlansController : ControllerBase
{
    private readonly IFloorPlanService _floorPlanService;
    private readonly ILogger<FloorPlansController> _logger;

    // Maximum file size: 50 MB
    private const long MaxFileSize = 50 * 1024 * 1024;

    public FloorPlansController(IFloorPlanService floorPlanService, ILogger<FloorPlansController> logger)
    {
        _floorPlanService = floorPlanService ?? throw new ArgumentNullException(nameof(floorPlanService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Get all floor plans for a floor
    /// </summary>
    /// <param name="floorId">Floor ID</param>
    /// <returns>List of floor plans</returns>
    [HttpGet("floor/{floorId}")]
    [ProducesResponseType(typeof(List<FloorPlanSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<FloorPlanSummaryDto>>> GetFloorPlans(
        [FromRoute] Guid floorId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (floorId == Guid.Empty)
                return BadRequest("Floor ID is required");

            var result = await _floorPlanService.GetFloorPlansAsync(floorId, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Floor not found: {FloorId}", floorId);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving floor plans for floor {FloorId}", floorId);
            return StatusCode(500, "Error retrieving floor plans");
        }
    }

    /// <summary>
    /// Get active floor plan for a floor
    /// </summary>
    /// <param name="floorId">Floor ID</param>
    /// <returns>Active floor plan or 404</returns>
    [HttpGet("floor/{floorId}/active")]
    [ProducesResponseType(typeof(FloorPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FloorPlanDto>> GetActiveFloorPlan(
        [FromRoute] Guid floorId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (floorId == Guid.Empty)
                return BadRequest("Floor ID is required");

            var result = await _floorPlanService.GetActiveFloorPlanAsync(floorId, cancellationToken);
            return result != null ? Ok(result) : NotFound($"No active floor plan for floor {floorId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active floor plan for floor {FloorId}", floorId);
            return StatusCode(500, "Error retrieving active floor plan");
        }
    }

    /// <summary>
    /// Get floor plan details by ID
    /// </summary>
    /// <param name="floorPlanId">Floor plan ID</param>
    /// <returns>Floor plan details with annotations</returns>
    [HttpGet("{floorPlanId}")]
    [ProducesResponseType(typeof(FloorPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FloorPlanDto>> GetFloorPlan(
        [FromRoute] Guid floorPlanId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (floorPlanId == Guid.Empty)
                return BadRequest("Floor plan ID is required");

            var result = await _floorPlanService.GetFloorPlanAsync(floorPlanId, cancellationToken);
            return result != null ? Ok(result) : NotFound($"Floor plan {floorPlanId} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving floor plan {FloorPlanId}", floorPlanId);
            return StatusCode(500, "Error retrieving floor plan");
        }
    }

    /// <summary>
    /// Download floor plan file
    /// </summary>
    /// <param name="floorPlanId">Floor plan ID</param>
    /// <remarks>Returns the actual file content (image or PDF)</remarks>
    [HttpGet("{floorPlanId}/download")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadFloorPlan(
        [FromRoute] Guid floorPlanId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (floorPlanId == Guid.Empty)
                return BadRequest("Floor plan ID is required");

            var (content, contentType, fileName) = await _floorPlanService.GetFloorPlanFileAsync(floorPlanId, cancellationToken);
            return File(content, contentType, fileName);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Floor plan not found: {FloorPlanId}", floorPlanId);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading floor plan {FloorPlanId}", floorPlanId);
            return StatusCode(500, "Error downloading floor plan");
        }
    }

    /// <summary>
    /// Upload a new floor plan
    /// </summary>
    /// <remarks>
    /// Supported formats: PNG, JPEG, WebP, SVG, PDF, TIFF, Visio
    /// Maximum file size: 50 MB
    /// </remarks>
    [HttpPost("upload")]
    [ProducesResponseType(typeof(FloorPlanDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status413PayloadTooLarge)]
    public async Task<ActionResult<FloorPlanDto>> UploadFloorPlan(
        [FromQuery] Guid floorId,
        [FromQuery] bool setAsActive = true,
        [FromQuery] decimal? widthMeters = null,
        [FromQuery] decimal? heightMeters = null,
        [FromQuery] decimal? scaleFactor = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (floorId == Guid.Empty)
                return BadRequest("Floor ID is required");

            var file = Request.Form.Files.FirstOrDefault();
            if (file == null || file.Length == 0)
                return BadRequest("No file provided");

            if (file.Length > MaxFileSize)
                return StatusCode(StatusCodes.Status413PayloadTooLarge, $"File size exceeds {MaxFileSize / (1024 * 1024)}MB limit");

            // Read file content
            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream, cancellationToken);
                var fileData = stream.ToArray();

                var uploadDto = new FloorPlanUploadDto
                {
                    FloorId = floorId,
                    FileName = file.FileName,
                    ContentType = file.ContentType,
                    FileSize = file.Length,
                    FileData = fileData,
                    WidthMeters = widthMeters,
                    HeightMeters = heightMeters,
                    ScaleFactor = scaleFactor,
                    SetAsActive = setAsActive
                };

                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
                var result = await _floorPlanService.UploadFloorPlanAsync(uploadDto, userId, cancellationToken);
                return CreatedAtAction(nameof(GetFloorPlan), new { floorPlanId = result.Id }, result);
            }
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Floor not found: {FloorId}", floorId);
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation for floor {FloorId}", floorId);
            return BadRequest(ex.Message);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading floor plan");
            return StatusCode(500, "Error uploading floor plan");
        }
    }

    /// <summary>
    /// Set a floor plan as active
    /// </summary>
    /// <param name="floorPlanId">Floor plan ID to activate</param>
    [HttpPost("{floorPlanId}/set-active")]
    [ProducesResponseType(typeof(FloorPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FloorPlanDto>> SetActiveFloorPlan(
        [FromRoute] Guid floorPlanId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (floorPlanId == Guid.Empty)
                return BadRequest("Floor plan ID is required");

            var result = await _floorPlanService.SetActiveFloorPlanAsync(floorPlanId, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Floor plan not found: {FloorPlanId}", floorPlanId);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting active floor plan {FloorPlanId}", floorPlanId);
            return StatusCode(500, "Error setting active floor plan");
        }
    }

    /// <summary>
    /// Delete floor plan
    /// </summary>
    /// <param name="floorPlanId">Floor plan ID</param>
    [HttpDelete("{floorPlanId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteFloorPlan(
        [FromRoute] Guid floorPlanId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (floorPlanId == Guid.Empty)
                return BadRequest("Floor plan ID is required");

            await _floorPlanService.DeleteFloorPlanAsync(floorPlanId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Floor plan not found: {FloorPlanId}", floorPlanId);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting floor plan {FloorPlanId}", floorPlanId);
            return StatusCode(500, "Error deleting floor plan");
        }
    }

    /// <summary>
    /// Add annotation to floor plan
    /// </summary>
    /// <param name="dto">Annotation data</param>
    [HttpPost("annotations")]
    [ProducesResponseType(typeof(FloorPlanAnnotationDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FloorPlanAnnotationDto>> AddAnnotation(
        [FromBody] CreateFloorPlanAnnotationDto dto,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
            var result = await _floorPlanService.AddAnnotationAsync(dto, userId, cancellationToken);
            return CreatedAtAction(nameof(GetFloorPlan), new { floorPlanId = dto.FloorPlanId }, result);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Floor plan not found");
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding annotation");
            return StatusCode(500, "Error adding annotation");
        }
    }

    /// <summary>
    /// Delete floor plan annotation
    /// </summary>
    /// <param name="annotationId">Annotation ID</param>
    [HttpDelete("annotations/{annotationId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAnnotation(
        [FromRoute] Guid annotationId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (annotationId == Guid.Empty)
                return BadRequest("Annotation ID is required");

            await _floorPlanService.DeleteAnnotationAsync(annotationId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Annotation not found: {AnnotationId}", annotationId);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting annotation {AnnotationId}", annotationId);
            return StatusCode(500, "Error deleting annotation");
        }
    }
}
