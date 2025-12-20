using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace OfisYonetimSistemi.API.Filters;

/// <summary>
/// Global validation filter that standardizes validation error responses
/// </summary>
public class ValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (!context.ModelState.IsValid)
        {
            var errors = context.ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                );

            var response = new
            {
                code = "VALIDATION_ERROR",
                message = "One or more validation errors occurred",
                errors = errors,
                timestamp = DateTime.UtcNow
            };

            context.Result = new BadRequestObjectResult(response);
            return;
        }

        await next();
    }
}

/// <summary>
/// Attribute to disable automatic model validation
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class DisableValidationAttribute : Attribute { }
