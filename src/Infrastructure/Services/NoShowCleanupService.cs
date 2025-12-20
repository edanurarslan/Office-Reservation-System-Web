using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OfisYonetimSistemi.Application.DTOs;
using OfisYonetimSistemi.Domain.Entities;
using OfisYonetimSistemi.Domain.Enums;
using OfisYonetimSistemi.Infrastructure.Data;

namespace OfisYonetimSistemi.Infrastructure.Services;

/// <summary>
/// Interface for no-show cleanup and management operations (Task 4)
/// </summary>
public interface INoShowCleanupService
{
    /// <summary>
    /// Detect and record no-shows from expired reservations
    /// </summary>
    Task<int> DetectAndRecordNoShowsAsync(int gracePeriodMinutes = 15, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get user's no-show history
    /// </summary>
    Task<List<NoShowHistoryDto>> GetUserNoShowHistoryAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get current month's no-show count for user
    /// </summary>
    Task<int> GetCurrentMonthNoShowCountAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if user should be restricted due to no-shows
    /// </summary>
    Task<(bool IsRestricted, string Reason)> CheckUserRestrictionAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Waive a no-show penalty
    /// </summary>
    Task WaiveNoShowAsync(Guid noShowId, string reason, Guid adminUserId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get no-show statistics for location
    /// </summary>
    Task<NoShowStatisticsDto> GetLocationStatisticsAsync(Guid locationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Clean up old no-show records (retention policy)
    /// </summary>
    Task<int> CleanupOldNoShowsAsync(int retentionDays = 90, CancellationToken cancellationToken = default);
}

/// <summary>
/// No-show history DTO
/// </summary>
public class NoShowHistoryDto
{
    /// <summary>
    /// No-show record ID
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Reservation ID
    /// </summary>
    public Guid ReservationId { get; set; }

    /// <summary>
    /// Resource name
    /// </summary>
    public string ResourceName { get; set; } = string.Empty;

    /// <summary>
    /// Scheduled time
    /// </summary>
    public DateTime ScheduledStartTime { get; set; }

    /// <summary>
    /// Detected at
    /// </summary>
    public DateTime DetectedAt { get; set; }

    /// <summary>
    /// Penalty applied
    /// </summary>
    public string? PenaltyApplied { get; set; }

    /// <summary>
    /// Is waived
    /// </summary>
    public bool IsPenaltyWaived { get; set; }

    /// <summary>
    /// Monthly count
    /// </summary>
    public int MonthlyCount { get; set; }
}

/// <summary>
/// No-show statistics DTO
/// </summary>
public class NoShowStatisticsDto
{
    /// <summary>
    /// Location ID
    /// </summary>
    public Guid LocationId { get; set; }

    /// <summary>
    /// Total no-shows this month
    /// </summary>
    public int TotalThisMonth { get; set; }

    /// <summary>
    /// Total no-shows this year
    /// </summary>
    public int TotalThisYear { get; set; }

    /// <summary>
    /// Users with most no-shows
    /// </summary>
    public List<UserNoShowSummaryDto> TopOffenders { get; set; } = [];

    /// <summary>
    /// Trend (month over month)
    /// </summary>
    public decimal TrendPercentage { get; set; }

    /// <summary>
    /// Average per user
    /// </summary>
    public decimal AveragePerUser { get; set; }
}

/// <summary>
/// User no-show summary
/// </summary>
public class UserNoShowSummaryDto
{
    /// <summary>
    /// User ID
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// User name
    /// </summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>
    /// Total count
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// This month count
    /// </summary>
    public int ThisMonthCount { get; set; }

    /// <summary>
    /// Is restricted
    /// </summary>
    public bool IsRestricted { get; set; }
}

/// <summary>
/// No-show cleanup service implementation
/// </summary>
public class NoShowCleanupService : INoShowCleanupService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<NoShowCleanupService> _logger;

    // Threshold: user with 3+ no-shows in a month gets restricted
    private const int RestrictionThreshold = 3;

    // Restriction period: days to restrict user
    private const int RestrictionDays = 7;

    // Retention period: days to keep old records
    private const int RetentionDays = 90;

    public NoShowCleanupService(
        ApplicationDbContext context,
        ILogger<NoShowCleanupService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<int> DetectAndRecordNoShowsAsync(int gracePeriodMinutes = 15, CancellationToken cancellationToken = default)
    {
        try
        {
            var now = DateTime.UtcNow;
            var gracePeriod = TimeSpan.FromMinutes(gracePeriodMinutes);

            // Find reservations that should have started but have no check-in
            var noShowReservations = await _context.Reservations
                .Where(r => r.Status == ReservationStatus.Confirmed &&
                           r.StartsAt.AddMinutes(gracePeriodMinutes) < now &&
                           !r.IsDeleted &&
                           !_context.CheckIns.Any(ci => ci.ReservationId == r.Id))
                .Include(r => r.User)
                .Include(r => r.Desk)
                .Include(r => r.Room)
                .ToListAsync(cancellationToken);

            int recordedCount = 0;

            foreach (var reservation in noShowReservations)
            {
                // Check if already recorded
                var existing = await _context.NoShowHistories
                    .FirstOrDefaultAsync(nsh => nsh.ReservationId == reservation.Id, cancellationToken);

                if (existing != null)
                    continue;

                // Determine resource
                var resourceId = reservation.ResourceId;
                var resourceType = reservation.ResourceType.ToString();
                var resourceName = reservation.Desk?.Name ?? reservation.Room?.Name ?? "Unknown";
                
                // Get location from desk/room
                var locationId = reservation.Desk?.Zone?.Floor?.LocationId ?? reservation.Room?.LocationId ?? Guid.Empty;

                // Get current month count for user
                var monthStart = new DateTime(now.Year, now.Month, 1);
                var monthlyCount = await _context.NoShowHistories
                    .Where(nsh => nsh.UserId == reservation.UserId &&
                                 nsh.CreatedAt >= monthStart &&
                                 !nsh.IsDeleted)
                    .CountAsync(cancellationToken);

                // Create no-show record
                var noShow = new NoShowHistory
                {
                    ReservationId = reservation.Id,
                    UserId = reservation.UserId,
                    ResourceId = resourceId,
                    ResourceType = resourceType,
                    LocationId = locationId,
                    ScheduledStartTime = reservation.StartsAt,
                    DetectedAt = now,
                    GracePeriodMinutes = gracePeriodMinutes,
                    MonthlyCount = monthlyCount + 1,
                    PenaltyApplied = $"No-show recorded (Reservation: {reservation.Id})",
                    CreatedAt = now
                };

                _context.NoShowHistories.Add(noShow);

                // Update reservation status
                reservation.Status = ReservationStatus.NoShow;

                recordedCount++;
                _logger.LogInformation("No-show recorded for user {UserId}, reservation {ReservationId}, monthly count: {Count}",
                    reservation.UserId, reservation.Id, noShow.MonthlyCount);
            }

            if (recordedCount > 0)
            {
                await _context.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("Detected and recorded {Count} no-shows", recordedCount);
            }

            return recordedCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error detecting no-shows");
            throw;
        }
    }

    public async Task<List<NoShowHistoryDto>> GetUserNoShowHistoryAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var noShows = await _context.NoShowHistories
                .AsNoTracking()
                .Where(nsh => nsh.UserId == userId && !nsh.IsDeleted)
                .OrderByDescending(nsh => nsh.ScheduledStartTime)
                .Take(50) // Last 50 records
                .ToListAsync(cancellationToken);

            return noShows.Select(ns => new NoShowHistoryDto
            {
                Id = ns.Id,
                ReservationId = ns.ReservationId,
                ResourceName = $"{ns.ResourceType}: {ns.ResourceId}",
                ScheduledStartTime = ns.ScheduledStartTime,
                DetectedAt = ns.DetectedAt,
                PenaltyApplied = ns.PenaltyApplied,
                IsPenaltyWaived = ns.IsPenaltyWaived,
                MonthlyCount = ns.MonthlyCount
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving no-show history for user {UserId}", userId);
            throw;
        }
    }

    public async Task<int> GetCurrentMonthNoShowCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var now = DateTime.UtcNow;
            var monthStart = new DateTime(now.Year, now.Month, 1);

            return await _context.NoShowHistories
                .Where(nsh => nsh.UserId == userId &&
                             nsh.CreatedAt >= monthStart &&
                             !nsh.IsDeleted &&
                             !nsh.IsPenaltyWaived)
                .CountAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting no-show count for user {UserId}", userId);
            throw;
        }
    }

    public async Task<(bool IsRestricted, string Reason)> CheckUserRestrictionAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var count = await GetCurrentMonthNoShowCountAsync(userId, cancellationToken);

            if (count >= RestrictionThreshold)
            {
                return (true, $"User has {count} no-shows this month (threshold: {RestrictionThreshold}). Restricted for {RestrictionDays} days.");
            }

            return (false, "");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking restriction for user {UserId}", userId);
            throw;
        }
    }

    public async Task WaiveNoShowAsync(Guid noShowId, string reason, Guid adminUserId, CancellationToken cancellationToken = default)
    {
        try
        {
            var noShow = await _context.NoShowHistories.FindAsync(new object[] { noShowId }, cancellationToken: cancellationToken);
            if (noShow == null || noShow.IsDeleted)
                throw new KeyNotFoundException($"No-show record {noShowId} not found");

            noShow.IsPenaltyWaived = true;
            noShow.WaiverReason = reason;
            noShow.WaivedByUserId = adminUserId;
            noShow.WaivedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("No-show {NoShowId} waived by admin {AdminUserId}. Reason: {Reason}",
                noShowId, adminUserId, reason);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error waiving no-show {NoShowId}", noShowId);
            throw;
        }
    }

    public async Task<NoShowStatisticsDto> GetLocationStatisticsAsync(Guid locationId, CancellationToken cancellationToken = default)
    {
        try
        {
            var now = DateTime.UtcNow;
            var monthStart = new DateTime(now.Year, now.Month, 1);
            var lastMonthStart = monthStart.AddMonths(-1);

            // This month
            var thisMonth = await _context.NoShowHistories
                .Where(nsh => nsh.LocationId == locationId &&
                             nsh.CreatedAt >= monthStart &&
                             !nsh.IsDeleted)
                .CountAsync(cancellationToken);

            // This year
            var thisYear = await _context.NoShowHistories
                .Where(nsh => nsh.LocationId == locationId &&
                             nsh.CreatedAt.Year == now.Year &&
                             !nsh.IsDeleted)
                .CountAsync(cancellationToken);

            // Last month for trend
            var lastMonth = await _context.NoShowHistories
                .Where(nsh => nsh.LocationId == locationId &&
                             nsh.CreatedAt >= lastMonthStart &&
                             nsh.CreatedAt < monthStart &&
                             !nsh.IsDeleted)
                .CountAsync(cancellationToken);

            var trend = lastMonth > 0 ? ((decimal)(thisMonth - lastMonth) / lastMonth * 100) : 0;

            // Top offenders
            var topOffenders = await _context.NoShowHistories
                .Where(nsh => nsh.LocationId == locationId &&
                             nsh.CreatedAt >= monthStart &&
                             !nsh.IsDeleted)
                .GroupBy(nsh => new { nsh.UserId, nsh.User!.FirstName, nsh.User!.LastName })
                .Select(g => new UserNoShowSummaryDto
                {
                    UserId = g.Key.UserId,
                    UserName = g.Key.FirstName + " " + g.Key.LastName,
                    ThisMonthCount = g.Count(),
                    TotalCount = _context.NoShowHistories
                        .Where(nsh => nsh.UserId == g.Key.UserId && !nsh.IsDeleted)
                        .Count()
                })
                .OrderByDescending(x => x.ThisMonthCount)
                .Take(10)
                .ToListAsync(cancellationToken);

            // Update restriction status
            foreach (var user in topOffenders)
            {
                var (isRestricted, _) = await CheckUserRestrictionAsync(user.UserId, cancellationToken);
                user.IsRestricted = isRestricted;
            }

            var totalUsers = await _context.NoShowHistories
                .Where(nsh => nsh.LocationId == locationId &&
                             nsh.CreatedAt >= monthStart &&
                             !nsh.IsDeleted)
                .Select(nsh => nsh.UserId)
                .Distinct()
                .CountAsync(cancellationToken);

            var average = totalUsers > 0 ? (decimal)thisMonth / totalUsers : 0;

            return new NoShowStatisticsDto
            {
                LocationId = locationId,
                TotalThisMonth = thisMonth,
                TotalThisYear = thisYear,
                TopOffenders = topOffenders,
                TrendPercentage = trend,
                AveragePerUser = average
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting no-show statistics for location {LocationId}", locationId);
            throw;
        }
    }

    public async Task<int> CleanupOldNoShowsAsync(int retentionDays = 90, CancellationToken cancellationToken = default)
    {
        try
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);

            var oldRecords = await _context.NoShowHistories
                .Where(nsh => nsh.CreatedAt < cutoffDate &&
                             !nsh.IsDeleted &&
                             nsh.IsPenaltyWaived) // Only delete waived records
                .ToListAsync(cancellationToken);

            foreach (var record in oldRecords)
            {
                record.IsDeleted = true;
            }

            if (oldRecords.Count > 0)
            {
                await _context.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("Cleaned up {Count} old no-show records (older than {Days} days)",
                    oldRecords.Count, retentionDays);
            }

            return oldRecords.Count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up old no-shows");
            throw;
        }
    }
}
