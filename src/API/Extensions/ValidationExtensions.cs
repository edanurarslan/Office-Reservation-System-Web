using FluentValidation;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace OfisYonetimSistemi.API.Extensions;

/// <summary>
/// Extension methods for API validation
/// </summary>
public static class ApiValidationExtensions
{
    /// <summary>
    /// Convert FluentValidation errors to ModelState errors
    /// </summary>
    public static void ToModelState(this FluentValidation.Results.ValidationResult validationResult, ModelStateDictionary modelState)
    {
        foreach (var error in validationResult.Errors)
        {
            if (!modelState.ContainsKey(error.PropertyName))
            {
                modelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            else
            {
                modelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
        }
    }
}
