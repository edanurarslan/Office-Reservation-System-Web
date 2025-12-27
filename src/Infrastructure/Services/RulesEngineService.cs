using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OfisYonetimSistemi.Application.DTOs;
using OfisYonetimSistemi.Domain.Entities;
using OfisYonetimSistemi.Infrastructure.Data;

namespace OfisYonetimSistemi.Infrastructure.Services;

/// <summary>
/// Interface for rules engine operations
/// </summary>
public interface IRulesEngineService
{
    /// <summary>
    /// Create a new rule
    /// </summary>
    Task<RuleDto> CreateRuleAsync(RuleDto dto, Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update existing rule
    /// </summary>
    Task<RuleDto> UpdateRuleAsync(Guid ruleId, RuleDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get rule by ID
    /// </summary>
    Task<RuleDto?> GetRuleAsync(Guid ruleId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all rules (with filtering and pagination)
    /// </summary>
    Task<(List<RuleDto> Rules, int Total)> GetRulesAsync(RuleListQueryDto query, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete rule
    /// </summary>
    Task DeleteRuleAsync(Guid ruleId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Evaluate rules for a given context
    /// </summary>
    Task<BatchRuleEvaluationResult> EvaluateRulesAsync(RuleEvaluationContext context, CancellationToken cancellationToken = default);

    /// <summary>
    /// Evaluate specific rule
    /// </summary>
    Task<RuleEvaluationResult?> EvaluateRuleAsync(Guid ruleId, RuleEvaluationContext context, CancellationToken cancellationToken = default);

    /// <summary>
    /// Test rule condition
    /// </summary>
    Task<bool> TestRuleConditionAsync(Guid ruleId, RuleEvaluationContext context, CancellationToken cancellationToken = default);
}

/// <summary>
/// Rules engine service implementation
/// </summary>
public class RulesEngineService : IRulesEngineService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RulesEngineService> _logger;

    public RulesEngineService(
        ApplicationDbContext context,
        ILogger<RulesEngineService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<RuleDto> CreateRuleAsync(RuleDto dto, Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var ruleDefinition = JsonSerializer.Serialize(dto.RuleDsl);

            var rule = new Rule
            {
                Name = dto.Name,
                Description = dto.Description,
                Priority = dto.Priority,
                IsActive = dto.IsActive,
                Configuration = ruleDefinition,
                Scope = dto.Scope,
                TargetId = dto.TargetId,
                ValidFrom = dto.EffectiveFrom,
                ValidUntil = dto.EffectiveTo,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Rules.Add(rule);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Rule created: {RuleId} - {RuleName} by user {UserId}", rule.Id, rule.Name, userId);

            return MapToDto(rule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating rule");
            throw;
        }
    }

    public async Task<RuleDto> UpdateRuleAsync(Guid ruleId, RuleDto dto, CancellationToken cancellationToken = default)
    {
        try
        {
            var rule = await _context.Rules.FindAsync(new object[] { ruleId }, cancellationToken: cancellationToken);
            if (rule == null || rule.IsDeleted)
                throw new KeyNotFoundException($"Rule {ruleId} not found");

            rule.Name = dto.Name;
            rule.Description = dto.Description ?? "";
            rule.Priority = dto.Priority;
            rule.IsActive = dto.IsActive;
            rule.Configuration = JsonSerializer.Serialize(dto.RuleDsl);
            rule.Scope = dto.Scope;
            rule.TargetId = dto.TargetId;
            rule.ValidFrom = dto.EffectiveFrom;
            rule.ValidUntil = dto.EffectiveTo;
            rule.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Rule updated: {RuleId}", ruleId);

            return MapToDto(rule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating rule {RuleId}", ruleId);
            throw;
        }
    }

    public async Task<RuleDto?> GetRuleAsync(Guid ruleId, CancellationToken cancellationToken = default)
    {
        try
        {
            var rule = await _context.Rules
                .AsNoTracking()
                .Include(r => r.CreatedByUser)
                .FirstOrDefaultAsync(r => r.Id == ruleId && !r.IsDeleted, cancellationToken);

            return rule != null ? MapToDto(rule) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving rule {RuleId}", ruleId);
            throw;
        }
    }

    public async Task<(List<RuleDto> Rules, int Total)> GetRulesAsync(RuleListQueryDto query, CancellationToken cancellationToken = default)
    {
        try
        {
            var queryable = _context.Rules
                .AsNoTracking()
                .Include(r => r.CreatedByUser)
                .Where(r => !r.IsDeleted);

            // Apply filters
            if (!string.IsNullOrEmpty(query.RuleType))
                queryable = queryable.Where(r => r.RuleType == query.RuleType);

            if (!string.IsNullOrEmpty(query.Scope))
                queryable = queryable.Where(r => r.Scope == query.Scope);

            if (query.OnlyActive.HasValue)
                queryable = queryable.Where(r => r.IsActive == query.OnlyActive.Value);

            // Count total
            var total = await queryable.CountAsync(cancellationToken);

            // Sort and paginate
            queryable = query.SortBy switch
            {
                "Priority" => query.SortDescending 
                    ? queryable.OrderByDescending(r => r.Priority) 
                    : queryable.OrderBy(r => r.Priority),
                "Name" => query.SortDescending 
                    ? queryable.OrderByDescending(r => r.Name) 
                    : queryable.OrderBy(r => r.Name),
                "CreatedAt" => query.SortDescending 
                    ? queryable.OrderByDescending(r => r.CreatedAt) 
                    : queryable.OrderBy(r => r.CreatedAt),
                _ => query.SortDescending 
                    ? queryable.OrderByDescending(r => r.Priority) 
                    : queryable.OrderBy(r => r.Priority)
            };

            var rules = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync(cancellationToken);

            return (rules.Select(MapToDto).ToList(), total);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving rules");
            throw;
        }
    }

    public async Task DeleteRuleAsync(Guid ruleId, CancellationToken cancellationToken = default)
    {
        try
        {
            var rule = await _context.Rules.FindAsync(new object[] { ruleId }, cancellationToken: cancellationToken);
            if (rule == null || rule.IsDeleted)
                throw new KeyNotFoundException($"Rule {ruleId} not found");

            rule.IsDeleted = true;
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Rule deleted: {RuleId}", ruleId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting rule {RuleId}", ruleId);
            throw;
        }
    }

    public async Task<BatchRuleEvaluationResult> EvaluateRulesAsync(RuleEvaluationContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            // Get all applicable rules
            var rules = await _context.Rules
                .AsNoTracking()
                .Where(r => r.IsActive && !r.IsDeleted)
                .Where(r => IsRuleApplicable(r, context))
                .OrderBy(r => r.Priority)
                .ToListAsync(cancellationToken);

            var result = new BatchRuleEvaluationResult();

            foreach (var rule in rules)
            {
                var evalResult = EvaluateRule(rule, context);
                if (evalResult.ConditionMet)
                {
                    result.AppliedRules.Add(evalResult);

                    // Log application
                    await LogRuleApplicationAsync(rule.Id, context, cancellationToken);
                }
            }

            _logger.LogInformation("Rules evaluated: {AppliedCount} of {TotalCount} matched", result.AppliedRules.Count, rules.Count);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error evaluating rules");
            throw;
        }
    }

    public async Task<RuleEvaluationResult?> EvaluateRuleAsync(Guid ruleId, RuleEvaluationContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var rule = await _context.Rules
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == ruleId && r.IsActive && !r.IsDeleted, cancellationToken);

            if (rule == null)
                return null;

            if (!IsRuleApplicable(rule, context))
                return null;

            var result = EvaluateRule(rule, context);

            if (result.ConditionMet)
            {
                await LogRuleApplicationAsync(rule.Id, context, cancellationToken);
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error evaluating rule {RuleId}", ruleId);
            throw;
        }
    }

    public async Task<bool> TestRuleConditionAsync(Guid ruleId, RuleEvaluationContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var rule = await _context.Rules
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == ruleId, cancellationToken);

            if (rule == null)
                throw new KeyNotFoundException($"Rule {ruleId} not found");

            var result = EvaluateRule(rule, context);
            return result.ConditionMet;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing rule condition {RuleId}", ruleId);
            throw;
        }
    }

    // Helper methods
    private static bool IsRuleApplicable(Rule rule, RuleEvaluationContext context)
    {
        // Check time-based applicability
        if (rule.ValidFrom.HasValue && context.CurrentTime < rule.ValidFrom)
            return false;

        if (rule.ValidUntil.HasValue && context.CurrentTime > rule.ValidUntil)
            return false;

        return true;
    }

    private static RuleEvaluationResult EvaluateRule(Rule rule, RuleEvaluationContext context)
    {
        var result = new RuleEvaluationResult
        {
            RuleId = rule.Id,
            RuleName = rule.Name,
            Action = "",
            Priority = rule.Priority
        };

        try
        {
            var dsl = JsonSerializer.Deserialize<RuleDslDto>(rule.Configuration) ?? new();
            result.Action = dsl.Action;
            result.Parameters = dsl.Parameters ?? [];
            result.ConditionMet = EvaluateCondition(dsl.Condition, context);
        }
        catch
        {
            result.ConditionMet = false;
        }

        return result;
    }

    private static bool EvaluateCondition(string? condition, RuleEvaluationContext context)
    {
        if (string.IsNullOrEmpty(condition))
            return true; // No condition = always apply

        // Simple condition evaluation (can be extended to full DSL parser)
        try
        {
            // Example: "occupancy_percentage > 80"
            if (condition.Contains("occupancy_percentage"))
            {
                if (condition.Contains(">"))
                {
                    var parts = condition.Split('>');
                    if (int.TryParse(parts[1].Trim(), out var threshold))
                        return context.OccupancyPercentage > threshold;
                }
                else if (condition.Contains("<"))
                {
                    var parts = condition.Split('<');
                    if (int.TryParse(parts[1].Trim(), out var threshold))
                        return context.OccupancyPercentage < threshold;
                }
                else if (condition.Contains("=="))
                {
                    var parts = condition.Split("==");
                    if (int.TryParse(parts[1].Trim(), out var threshold))
                        return context.OccupancyPercentage == threshold;
                }
            }

            // Example: "time.hour >= 9 AND time.hour <= 11"
            if (condition.Contains("time.hour"))
            {
                var hour = context.CurrentTime.Hour;
                
                if (condition.Contains("AND"))
                {
                    var parts = condition.Split("AND");
                    var leftOk = EvaluateTimeCondition(parts[0].Trim(), hour);
                    var rightOk = EvaluateTimeCondition(parts[1].Trim(), hour);
                    return leftOk && rightOk;
                }
                else
                {
                    return EvaluateTimeCondition(condition, hour);
                }
            }

            return true; // Unknown condition = apply
        }
        catch
        {
            return true; // On error, apply the rule
        }
    }

    private static bool EvaluateTimeCondition(string condition, int hour)
    {
        if (condition.Contains(">="))
        {
            var parts = condition.Split(">=");
            if (int.TryParse(parts[1].Trim(), out var threshold))
                return hour >= threshold;
        }
        else if (condition.Contains("<="))
        {
            var parts = condition.Split("<=");
            if (int.TryParse(parts[1].Trim(), out var threshold))
                return hour <= threshold;
        }
        else if (condition.Contains(">"))
        {
            var parts = condition.Split('>');
            if (int.TryParse(parts[1].Trim(), out var threshold))
                return hour > threshold;
        }
        else if (condition.Contains("<"))
        {
            var parts = condition.Split('<');
            if (int.TryParse(parts[1].Trim(), out var threshold))
                return hour < threshold;
        }

        return true;
    }

    private async Task LogRuleApplicationAsync(Guid ruleId, RuleEvaluationContext context, CancellationToken cancellationToken)
    {
        try
        {
            var auditLog = new RuleAuditLog
            {
                RuleId = ruleId,
                AppliedAt = DateTime.UtcNow,
                ContextData = JsonSerializer.Serialize(new
                {
                    context.CurrentTime,
                    context.ReservationId,
                    context.ResourceId,
                    context.LocationId,
                    context.OccupancyPercentage
                })
            };

            _context.RuleAuditLogs.Add(auditLog);

            // Update applied count
            var rule = await _context.Rules.FindAsync(new object[] { ruleId }, cancellationToken: cancellationToken);
            if (rule != null)
            {
                //rule.AppliedCount++;
                rule.LastAppliedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging rule application {RuleId}", ruleId);
        }
    }

    private static RuleDto MapToDto(Rule entity)
    {
        var dsl = JsonSerializer.Deserialize<RuleDslDto>(entity.Configuration) ?? new();

        return new RuleDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Priority = entity.Priority,
            IsActive = entity.IsActive,
            RuleDsl = dsl,
            Scope = entity.Scope,
            TargetId = entity.TargetId,
            EffectiveFrom = entity.ValidFrom,
            EffectiveTo = entity.ValidUntil,
            AppliedCount = entity.AppliedCount,
            LastAppliedAt = entity.LastAppliedAt,
            CreatedByUser = entity.CreatedByUser?.FirstName + " " + entity.CreatedByUser?.LastName ?? "Unknown"
        };
    }
}
