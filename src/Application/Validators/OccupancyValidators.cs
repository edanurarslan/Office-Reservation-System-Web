using FluentValidation;
using OfisYonetimSistemi.Application.DTOs;

namespace OfisYonetimSistemi.Application.Validators;

/// <summary>
/// Validator for occupancy query parameters
/// </summary>
public class OccupancyQueryDtoValidator : AbstractValidator<OccupancyQueryDto>
{
    public OccupancyQueryDtoValidator()
    {
        RuleFor(x => x.LocationId)
            .NotEmpty()
            .WithMessage("Location ID is required");

        RuleFor(x => x.Days)
            .GreaterThan(0)
            .WithMessage("Days must be greater than 0")
            .LessThanOrEqualTo(365)
            .WithMessage("Days cannot exceed 365");

        RuleFor(x => x.StartDate)
            .LessThan(x => x.EndDate)
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("Start date must be before end date");

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date)
            .When(x => x.EndDate.HasValue)
            .WithMessage("End date cannot be in the past");

        RuleFor(x => x.StartDate)
            .GreaterThanOrEqualTo(DateTime.UtcNow.AddYears(-2))
            .When(x => x.StartDate.HasValue)
            .WithMessage("Start date cannot be more than 2 years in the past");
    }
}
