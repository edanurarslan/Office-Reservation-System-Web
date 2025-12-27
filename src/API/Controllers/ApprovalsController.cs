using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using OfisYonetimSistemi.Infrastructure.Data;
using OfisYonetimSistemi.Infrastructure.Services;
using OfisYonetimSistemi.Domain.Entities;
using OfisYonetimSistemi.Domain.Enums;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/approvals")]
public class ApprovalsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IAuditLogService _auditLogService;
    private readonly ILogger<ApprovalsController> _logger;

    public ApprovalsController(
        ApplicationDbContext context,
        IAuditLogService auditLogService,
        ILogger<ApprovalsController> logger)
    {
        _context = context;
        _auditLogService = auditLogService;
        _logger = logger;
    }

    // GET /approvals - Tüm onay isteklerini getir
    [HttpGet]
    [AllowAnonymous] // Geliştirme için, production'da [Authorize] kullanın
    public async Task<IActionResult> GetApprovals(
        [FromQuery] string? status,
        [FromQuery] string? type,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = _context.ApprovalRequests
            .Include(a => a.Requester)
            .Include(a => a.Reviewer)
            .Where(a => !a.IsDeleted)
            .AsQueryable();

        // Status filtresi
        if (!string.IsNullOrEmpty(status))
        {
            if (Enum.TryParse<ApprovalStatus>(status, true, out var statusEnum))
            {
                query = query.Where(a => a.Status == statusEnum);
            }
        }

        // Type filtresi
        if (!string.IsNullOrEmpty(type))
        {
            if (Enum.TryParse<ApprovalRequestType>(type, true, out var typeEnum))
            {
                query = query.Where(a => a.RequestType == typeEnum);
            }
        }

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var approvals = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                a.Id,
                UserName = a.Requester != null ? $"{a.Requester.FirstName} {a.Requester.LastName}" : "Bilinmeyen",
                UserId = a.RequesterId,
                Type = a.RequestType.ToString(),
                RequestDate = a.CreatedAt.ToString("yyyy-MM-dd"),
                Status = a.Status.ToString(),
                a.Description,
                a.RequestData,
                a.RelatedEntityId,
                a.RelatedEntityType,
                ReviewerId = a.ReviewerId,
                ReviewerName = a.Reviewer != null ? $"{a.Reviewer.FirstName} {a.Reviewer.LastName}" : null,
                a.ReviewedAt,
                a.ReviewNotes,
                a.RejectionReason
            })
            .ToListAsync();

        return Ok(new
        {
            data = approvals,
            totalCount,
            totalPages,
            currentPage = page,
            pageSize
        });
    }

    // GET /approvals/{id} - Tek onay isteğini getir
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetApproval([FromRoute] Guid id)
    {
        var approval = await _context.ApprovalRequests
            .Include(a => a.Requester)
            .Include(a => a.Reviewer)
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);

        if (approval == null)
            return NotFound(new { message = $"Onay isteği bulunamadı: {id}" });

        return Ok(new
        {
            approval.Id,
            UserName = approval.Requester != null ? $"{approval.Requester.FirstName} {approval.Requester.LastName}" : "Bilinmeyen",
            UserId = approval.RequesterId,
            Type = approval.RequestType.ToString(),
            RequestDate = approval.CreatedAt.ToString("yyyy-MM-dd"),
            Status = approval.Status.ToString(),
            approval.Description,
            approval.RequestData,
            approval.RelatedEntityId,
            approval.RelatedEntityType,
            ReviewerId = approval.ReviewerId,
            ReviewerName = approval.Reviewer != null ? $"{approval.Reviewer.FirstName} {approval.Reviewer.LastName}" : null,
            approval.ReviewedAt,
            approval.ReviewNotes,
            approval.RejectionReason
        });
    }

    // POST /approvals - Yeni onay isteği oluştur
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateApproval([FromBody] CreateApprovalRequest request)
    {
        if (!Enum.TryParse<ApprovalRequestType>(request.Type, true, out var requestType))
        {
            return BadRequest(new { message = "Geçersiz istek türü" });
        }

        var approval = new ApprovalRequest
        {
            Id = Guid.NewGuid(),
            RequesterId = request.RequesterId,
            RequestType = requestType,
            Status = ApprovalStatus.Pending,
            Description = request.Description,
            RequestData = request.RequestData,
            RelatedEntityId = request.RelatedEntityId,
            RelatedEntityType = request.RelatedEntityType,
            CreatedAt = DateTime.UtcNow
        };

        _context.ApprovalRequests.Add(approval);
        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(
            "CREATE",
            "ApprovalRequest",
            approval.Id,
            null,
            new { approval.RequestType, approval.RequesterId, approval.Description },
            $"Yeni onay isteği oluşturuldu: {approval.RequestType}"
        );

        _logger.LogInformation("Yeni onay isteği oluşturuldu: {Id}", approval.Id);

        return CreatedAtAction(nameof(GetApproval), new { id = approval.Id }, new
        {
            approval.Id,
            Type = approval.RequestType.ToString(),
            Status = approval.Status.ToString(),
            approval.Description,
            CreatedAt = approval.CreatedAt
        });
    }

    // PUT /approvals/{id}/approve - Onay isteğini onayla
    [HttpPut("{id}/approve")]
    [AllowAnonymous]
    public async Task<IActionResult> ApproveRequest([FromRoute] Guid id, [FromBody] ReviewApprovalRequest request)
    {
        var approval = await _context.ApprovalRequests.FindAsync(id);
        if (approval == null || approval.IsDeleted)
            return NotFound(new { message = $"Onay isteği bulunamadı: {id}" });

        if (approval.Status != ApprovalStatus.Pending)
            return BadRequest(new { message = "Bu istek zaten işlenmiş" });

        var oldStatus = approval.Status;
        approval.Status = ApprovalStatus.Approved;
        approval.ReviewerId = request.ReviewerId;
        approval.ReviewedAt = DateTime.UtcNow;
        approval.ReviewNotes = request.Notes;
        approval.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(
            "APPROVE",
            "ApprovalRequest",
            approval.Id,
            new { Status = oldStatus.ToString() },
            new { Status = approval.Status.ToString(), approval.ReviewerId, approval.ReviewNotes },
            $"Onay isteği onaylandı: {approval.Id}"
        );

        _logger.LogInformation("Onay isteği onaylandı: {Id}", approval.Id);

        return Ok(new
        {
            message = "İstek onaylandı",
            approval.Id,
            Status = approval.Status.ToString(),
            approval.ReviewedAt
        });
    }

    // PUT /approvals/{id}/reject - Onay isteğini reddet
    [HttpPut("{id}/reject")]
    [AllowAnonymous]
    public async Task<IActionResult> RejectRequest([FromRoute] Guid id, [FromBody] ReviewApprovalRequest request)
    {
        var approval = await _context.ApprovalRequests.FindAsync(id);
        if (approval == null || approval.IsDeleted)
            return NotFound(new { message = $"Onay isteği bulunamadı: {id}" });

        if (approval.Status != ApprovalStatus.Pending)
            return BadRequest(new { message = "Bu istek zaten işlenmiş" });

        var oldStatus = approval.Status;
        approval.Status = ApprovalStatus.Rejected;
        approval.ReviewerId = request.ReviewerId;
        approval.ReviewedAt = DateTime.UtcNow;
        approval.ReviewNotes = request.Notes;
        approval.RejectionReason = request.RejectionReason;
        approval.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(
            "REJECT",
            "ApprovalRequest",
            approval.Id,
            new { Status = oldStatus.ToString() },
            new { Status = approval.Status.ToString(), approval.ReviewerId, approval.RejectionReason },
            $"Onay isteği reddedildi: {approval.Id}"
        );

        _logger.LogInformation("Onay isteği reddedildi: {Id}", approval.Id);

        return Ok(new
        {
            message = "İstek reddedildi",
            approval.Id,
            Status = approval.Status.ToString(),
            approval.ReviewedAt,
            approval.RejectionReason
        });
    }

    // DELETE /approvals/{id} - Onay isteğini sil (soft delete)
    [HttpDelete("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> DeleteApproval([FromRoute] Guid id)
    {
        var approval = await _context.ApprovalRequests.FindAsync(id);
        if (approval == null || approval.IsDeleted)
            return NotFound(new { message = $"Onay isteği bulunamadı: {id}" });

        approval.IsDeleted = true;
        approval.DeletedAt = DateTime.UtcNow;
        approval.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(
            "DELETE",
            "ApprovalRequest",
            approval.Id,
            new { approval.RequestType, approval.Status },
            null,
            $"Onay isteği silindi: {approval.Id}"
        );

        _logger.LogInformation("Onay isteği silindi: {Id}", approval.Id);

        return Ok(new { message = "İstek silindi" });
    }

    // GET /approvals/pending-count - Bekleyen onay sayısı
    [HttpGet("pending-count")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPendingCount()
    {
        var count = await _context.ApprovalRequests
            .Where(a => !a.IsDeleted && a.Status == ApprovalStatus.Pending)
            .CountAsync();

        return Ok(new { pendingCount = count });
    }

    // GET /approvals/stats - Onay istatistikleri
    [HttpGet("stats")]
    [AllowAnonymous]
    public async Task<IActionResult> GetStats()
    {
        var approvals = await _context.ApprovalRequests
            .Where(a => !a.IsDeleted)
            .ToListAsync();

        var stats = new
        {
            total = approvals.Count,
            pending = approvals.Count(a => a.Status == ApprovalStatus.Pending),
            approved = approvals.Count(a => a.Status == ApprovalStatus.Approved),
            rejected = approvals.Count(a => a.Status == ApprovalStatus.Rejected),
            byType = approvals
                .GroupBy(a => a.RequestType)
                .Select(g => new { type = g.Key.ToString(), count = g.Count() })
                .ToList()
        };

        return Ok(stats);
    }
}

// Request DTOs
public class CreateApprovalRequest
{
    [Required]
    public Guid RequesterId { get; set; }

    [Required]
    public string Type { get; set; } = string.Empty;

    public string? Description { get; set; }
    public string? RequestData { get; set; }
    public Guid? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; }
}

public class ReviewApprovalRequest
{
    public Guid? ReviewerId { get; set; }
    public string? Notes { get; set; }
    public string? RejectionReason { get; set; }
}
