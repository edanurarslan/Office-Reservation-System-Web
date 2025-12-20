using FluentValidation;
using OfisYonetimSistemi.Application.DTOs;

namespace OfisYonetimSistemi.Application.Validators;

/// <summary>
/// Validator for check-out operation
/// </summary>
public class CheckOutDtoValidator : AbstractValidator<CheckOutDto>
{
    public CheckOutDtoValidator()
    {
        RuleFor(x => x.DeviceInfo)
            .MaximumLength(200)
            .WithMessage("Device info cannot exceed 200 characters");

        RuleFor(x => x.Notes)
            .MaximumLength(500)
            .WithMessage("Notes cannot exceed 500 characters");
    }
}
