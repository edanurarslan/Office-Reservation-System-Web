using FluentValidation;
using OfisYonetimSistemi.Application.DTOs;

namespace OfisYonetimSistemi.Application.Validators;

/// <summary>
/// Validator for creating a new reservation
/// </summary>
public class CreateReservationDtoValidator : AbstractValidator<CreateReservationDto>
{
    public CreateReservationDtoValidator()
    {
        RuleFor(x => x.ResourceType)
            .NotEmpty()
            .WithMessage("Resource type is required")
            .Must(x => x == "desk" || x == "room")
            .WithMessage("Resource type must be 'desk' or 'room'");

        RuleFor(x => x.ResourceId)
            .NotEmpty()
            .WithMessage("Resource ID is required");

        RuleFor(x => x.StartsAt)
            .NotEmpty()
            .WithMessage("Start date/time is required")
            .GreaterThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Start date/time must be in the future");

        RuleFor(x => x.EndsAt)
            .NotEmpty()
            .WithMessage("End date/time is required")
            .GreaterThan(x => x.StartsAt)
            .WithMessage("End date/time must be after start date/time");

        RuleFor(x => x.Notes)
            .MaximumLength(500)
            .WithMessage("Notes cannot exceed 500 characters");

        RuleFor(x => x.Purpose)
            .MaximumLength(200)
            .WithMessage("Purpose cannot exceed 200 characters");

        RuleFor(x => x.ExpectedAttendees)
            .GreaterThan(0)
            .When(x => x.ExpectedAttendees.HasValue)
            .WithMessage("Expected attendees must be greater than 0");

        RuleFor(x => x.ExpectedAttendees)
            .LessThanOrEqualTo(200)
            .When(x => x.ExpectedAttendees.HasValue)
            .WithMessage("Expected attendees cannot exceed 200");

        RuleFor(x => x.RecurrencePattern)
            .MaximumLength(500)
            .When(x => x.IsRecurring)
            .WithMessage("Recurrence pattern cannot exceed 500 characters");

        // Ensure duration is reasonable (e.g., max 8 hours for desk, 4 hours for room)
        RuleFor(x => new { x.StartsAt, x.EndsAt, x.ResourceType })
            .Must(x =>
            {
                var duration = (x.EndsAt - x.StartsAt).TotalHours;
                return x.ResourceType == "desk" ? duration <= 8 : duration <= 4;
            })
            .WithMessage(x => $"Maximum reservation duration for {x.ResourceType} is {(x.ResourceType == "desk" ? "8" : "4")} hours");
    }
}

/// <summary>
/// Validator for updating a reservation
/// </summary>
public class UpdateReservationDtoValidator : AbstractValidator<UpdateReservationDto>
{
    public UpdateReservationDtoValidator()
    {
        RuleFor(x => x.ResourceType)
            .Must(x => x == null || x == "desk" || x == "room")
            .WithMessage("Resource type must be 'desk' or 'room' if provided");

        RuleFor(x => x.ResourceId)
            .NotEmpty()
            .When(x => x.ResourceId.HasValue)
            .WithMessage("Resource ID must be a valid GUID");

        RuleFor(x => x.StartsAt)
            .GreaterThanOrEqualTo(DateTime.UtcNow)
            .When(x => x.StartsAt.HasValue)
            .WithMessage("Start date/time must be in the future");

        RuleFor(x => x.EndsAt)
            .GreaterThan(x => x.StartsAt ?? DateTime.MinValue)
            .When(x => x.EndsAt.HasValue && x.StartsAt.HasValue)
            .WithMessage("End date/time must be after start date/time");

        RuleFor(x => x.Notes)
            .MaximumLength(500)
            .WithMessage("Notes cannot exceed 500 characters");

        RuleFor(x => x.Purpose)
            .MaximumLength(200)
            .WithMessage("Purpose cannot exceed 200 characters");

        RuleFor(x => x.ExpectedAttendees)
            .GreaterThan(0)
            .When(x => x.ExpectedAttendees.HasValue)
            .WithMessage("Expected attendees must be greater than 0");

        RuleFor(x => x.ExpectedAttendees)
            .LessThanOrEqualTo(200)
            .When(x => x.ExpectedAttendees.HasValue)
            .WithMessage("Expected attendees cannot exceed 200");
    }
}

/// <summary>
/// Validator for cancelling a reservation
/// </summary>
public class CancelReservationDtoValidator : AbstractValidator<CancelReservationDto>
{
    public CancelReservationDtoValidator()
    {
        RuleFor(x => x.CancellationReason)
            .MaximumLength(500)
            .WithMessage("Cancellation reason cannot exceed 500 characters");
    }
}
