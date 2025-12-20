using FluentValidation;

namespace OfisYonetimSistemi.Application.Validators;

/// <summary>
/// Custom validators for common business logic
/// </summary>
public static class CustomValidators
{
    /// <summary>
    /// Validate that a GUID is not empty
    /// </summary>
    public static IRuleBuilderOptions<T, Guid> NotEmptyGuid<T>(this IRuleBuilder<T, Guid> ruleBuilder)
    {
        return ruleBuilder
            .Must(g => g != Guid.Empty)
            .WithMessage("The specified ID must be a valid GUID");
    }

    /// <summary>
    /// Validate that a GUID is not empty (nullable)
    /// </summary>
    public static IRuleBuilderOptions<T, Guid?> NotEmptyGuid<T>(this IRuleBuilder<T, Guid?> ruleBuilder)
    {
        return ruleBuilder
            .Must(g => !g.HasValue || g.Value != Guid.Empty)
            .WithMessage("The specified ID must be a valid GUID");
    }

    /// <summary>
    /// Validate email format
    /// </summary>
    public static IRuleBuilderOptions<T, string> ValidEmail<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .Matches(@"^[^@\s]+@[^@\s]+\.[^@\s]+$")
            .WithMessage("Invalid email format");
    }

    /// <summary>
    /// Validate phone number (basic)
    /// </summary>
    public static IRuleBuilderOptions<T, string> ValidPhoneNumber<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .Matches(@"^[0-9\-\+\(\)\s]+$")
            .WithMessage("Invalid phone number format")
            .Length(7, 20)
            .WithMessage("Phone number must be between 7 and 20 characters");
    }

    /// <summary>
    /// Validate username (alphanumeric with optional underscore/dash)
    /// </summary>
    public static IRuleBuilderOptions<T, string> ValidUsername<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .Matches(@"^[a-zA-Z0-9_-]+$")
            .WithMessage("Username can only contain letters, numbers, underscores, and dashes")
            .Length(3, 50)
            .WithMessage("Username must be between 3 and 50 characters");
    }

    /// <summary>
    /// Validate password strength
    /// </summary>
    public static IRuleBuilderOptions<T, string> StrongPassword<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters long")
            .Matches(@"[A-Z]")
            .WithMessage("Password must contain at least one uppercase letter")
            .Matches(@"[a-z]")
            .WithMessage("Password must contain at least one lowercase letter")
            .Matches(@"[0-9]")
            .WithMessage("Password must contain at least one number")
            .Matches(@"[^a-zA-Z0-9]")
            .WithMessage("Password must contain at least one special character");
    }
}
