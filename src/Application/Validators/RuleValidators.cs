using FluentValidation;
using OfisYonetimSistemi.Application.DTOs;

namespace OfisYonetimSistemi.Application.Validators;

/// <summary>
/// Validator for rule creation/update
/// </summary>
public class RuleValidator : AbstractValidator<RuleDto>
{
    private static readonly string[] AllowedRuleTypes = 
    { 
        "Pricing", "Availability", "NoShow", "Capacity", "Notification" 
    };

    private static readonly string[] AllowedScopes = 
    { 
        "Global", "Location", "Floor", "Zone", "Resource" 
    };

    private static readonly string[] AllowedActions = 
    { 
        "apply_surcharge", "restrict_booking", "mark_unavailable", "send_notification", 
        "mark_noshow", "auto_checkout", "adjust_pricing" 
    };

    public RuleValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Rule name is required")
            .MaximumLength(200)
            .WithMessage("Rule name cannot exceed 200 characters");

        RuleFor(x => x.RuleType)
            .NotEmpty()
            .WithMessage("Rule type is required")
            .Must(x => AllowedRuleTypes.Contains(x))
            .WithMessage($"Rule type must be one of: {string.Join(", ", AllowedRuleTypes)}");

        RuleFor(x => x.Priority)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Priority must be at least 0")
            .LessThanOrEqualTo(100)
            .WithMessage("Priority cannot exceed 100");

        RuleFor(x => x.Scope)
            .NotEmpty()
            .WithMessage("Scope is required")
            .Must(x => AllowedScopes.Contains(x))
            .WithMessage($"Scope must be one of: {string.Join(", ", AllowedScopes)}");

        RuleFor(x => x)
            .Must(HaveValidTargetId)
            .WithMessage("Target ID is required for non-global scopes");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .When(x => !string.IsNullOrEmpty(x.Description))
            .WithMessage("Description cannot exceed 1000 characters");

        RuleFor(x => x.RuleDsl)
            .NotNull()
            .WithMessage("Rule definition is required");

        RuleFor(x => x.RuleDsl!.Action)
            .NotEmpty()
            .WithMessage("Action is required")
            .Must(x => AllowedActions.Contains(x))
            .WithMessage($"Action must be one of: {string.Join(", ", AllowedActions)}")
            .When(x => x.RuleDsl != null);

        RuleFor(x => x.EffectiveFrom)
            .LessThan(x => x.EffectiveTo)
            .Unless(x => x.EffectiveTo == null)
            .WithMessage("Effective from date must be before effective to date");
    }

    private static bool HaveValidTargetId(RuleDto dto)
    {
        if (dto.Scope == "Global")
            return true;

        return dto.TargetId.HasValue && dto.TargetId != Guid.Empty;
    }
}

/// <summary>
/// Validator for rule DSL
/// </summary>
public class RuleDslValidator : AbstractValidator<RuleDslDto>
{
    private static readonly string[] AllowedTriggers = 
    { 
        "on_reservation_created", "on_check_in", "on_check_out", "on_schedule", 
        "on_occupancy_change", "on_time_change" 
    };

    public RuleDslValidator()
    {
        RuleFor(x => x.Action)
            .NotEmpty()
            .WithMessage("Action is required");

        RuleFor(x => x.Triggers)
            .ForEach(trigger => trigger
                .Must(x => AllowedTriggers.Contains(x))
                .WithMessage($"Invalid trigger. Allowed: {string.Join(", ", AllowedTriggers)}"))
            .When(x => x.Triggers != null && x.Triggers.Count > 0);

        // Validate action-specific parameters
        RuleFor(x => x)
            .Must(HaveValidParameters)
            .WithMessage("Invalid parameters for the specified action");
    }

    private static bool HaveValidParameters(RuleDslDto dto)
    {
        return dto.Action switch
        {
            "apply_surcharge" => dto.Parameters.ContainsKey("percentage") || dto.Parameters.ContainsKey("flatAmount"),
            "send_notification" => dto.Parameters.ContainsKey("template") || dto.Parameters.ContainsKey("message"),
            "mark_unavailable" => dto.Parameters.ContainsKey("reason"),
            "mark_noshow" => true, // No specific parameters required
            "auto_checkout" => true,
            "adjust_pricing" => dto.Parameters.ContainsKey("multiplier") || dto.Parameters.ContainsKey("amount"),
            "restrict_booking" => dto.Parameters.ContainsKey("reason"),
            _ => true
        };
    }
}

/// <summary>
/// Validator for rule evaluation context
/// </summary>
public class RuleEvaluationContextValidator : AbstractValidator<RuleEvaluationContext>
{
    public RuleEvaluationContextValidator()
    {
        RuleFor(x => x.OccupancyPercentage)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Occupancy percentage must be at least 0")
            .LessThanOrEqualTo(100)
            .WithMessage("Occupancy percentage cannot exceed 100");
    }
}

/// <summary>
/// Validator for rule list queries
/// </summary>
public class RuleListQueryValidator : AbstractValidator<RuleListQueryDto>
{
    public RuleListQueryValidator()
    {
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
