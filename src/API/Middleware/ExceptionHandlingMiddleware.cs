using Microsoft.AspNetCore.Http;
using OfisYonetimSistemi.Application.Exceptions;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OfisYonetimSistemi.API.Middleware;

/// <summary>
/// Global exception handling middleware
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ErrorResponse
        {
            Timestamp = DateTime.UtcNow,
            TraceId = context.TraceIdentifier
        };

        switch (exception)
        {
            case ValidationException validationEx:
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                response.Code = validationEx.ErrorCode;
                response.Message = validationEx.Message;
                response.Errors = validationEx.Failures;
                break;

            case ResourceNotFoundException resourceNotFoundEx:
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                response.Code = resourceNotFoundEx.ErrorCode;
                response.Message = resourceNotFoundEx.Message;
                response.Details = resourceNotFoundEx.Details;
                break;

            case DuplicateResourceException duplicateEx:
                context.Response.StatusCode = StatusCodes.Status409Conflict;
                response.Code = duplicateEx.ErrorCode;
                response.Message = duplicateEx.Message;
                response.Details = duplicateEx.Details;
                break;

            case ConflictException conflictEx:
                context.Response.StatusCode = StatusCodes.Status409Conflict;
                response.Code = conflictEx.ErrorCode;
                response.Message = conflictEx.Message;
                response.Details = conflictEx.Details;
                break;

            case UnauthorizedException unauthorizedEx:
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                response.Code = unauthorizedEx.ErrorCode;
                response.Message = unauthorizedEx.Message;
                break;

            case ForbiddenException forbiddenEx:
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                response.Code = forbiddenEx.ErrorCode;
                response.Message = forbiddenEx.Message;
                break;

            case InvalidOperationStateException invalidStateEx:
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                response.Code = invalidStateEx.ErrorCode;
                response.Message = invalidStateEx.Message;
                response.Details = invalidStateEx.Details;
                break;

            case OperationTimeoutException timeoutEx:
                context.Response.StatusCode = StatusCodes.Status408RequestTimeout;
                response.Code = timeoutEx.ErrorCode;
                response.Message = timeoutEx.Message;
                response.Details = timeoutEx.Details;
                break;

            case Application.Exceptions.ApplicationException appEx:
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                response.Code = appEx.ErrorCode;
                response.Message = appEx.Message;
                response.Details = appEx.Details;
                break;

            default:
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                response.Code = "INTERNAL_SERVER_ERROR";
                response.Message = "An unexpected error occurred";
#if DEBUG
                response.Details = new Dictionary<string, object>
                {
                    { "ExceptionType", exception.GetType().Name },
                    { "ExceptionMessage", exception.Message },
                    { "StackTrace", exception.StackTrace ?? "No stack trace available" }
                };
#endif
                break;
        }

        return context.Response.WriteAsJsonAsync(response, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        });
    }
}

/// <summary>
/// Standard error response format
/// </summary>
public class ErrorResponse
{
    [JsonPropertyName("code")]
    public string Code { get; set; } = "ERROR";

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("errors")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public Dictionary<string, string[]>? Errors { get; set; }

    [JsonPropertyName("details")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public Dictionary<string, object>? Details { get; set; }

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; }

    [JsonPropertyName("traceId")]
    public string? TraceId { get; set; }
}

/// <summary>
/// Extension methods for adding exception handling middleware
/// </summary>
public static class ExceptionHandlingExtensions
{
    public static IApplicationBuilder UseExceptionHandling(this IApplicationBuilder app)
    {
        return app.UseMiddleware<ExceptionHandlingMiddleware>();
    }
}
