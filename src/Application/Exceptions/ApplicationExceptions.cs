namespace OfisYonetimSistemi.Application.Exceptions;

/// <summary>
/// Base exception class for all application exceptions
/// </summary>
public abstract class ApplicationException : Exception
{
    public string ErrorCode { get; set; }
    public Dictionary<string, object>? Details { get; set; }
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

    protected ApplicationException(string message, string errorCode, Exception? innerException = null, Dictionary<string, object>? details = null)
        : base(message, innerException)
    {
        ErrorCode = errorCode;
        Details = details ?? new Dictionary<string, object>();
    }
}

/// <summary>
/// Exception for validation errors
/// </summary>
public class ValidationException : ApplicationException
{
    public Dictionary<string, string[]> Failures { get; set; }

    public ValidationException(Dictionary<string, string[]> failures)
        : base("One or more validation errors occurred", "VALIDATION_ERROR", null, null)
    {
        Failures = failures;
    }

    public ValidationException(string message, string errorCode = "VALIDATION_ERROR")
        : base(message, errorCode)
    {
        Failures = new Dictionary<string, string[]>();
    }
}

/// <summary>
/// Exception for business logic errors
/// </summary>
public class BusinessException : ApplicationException
{
    public BusinessException(string message, string errorCode = "BUSINESS_ERROR", Exception? innerException = null, Dictionary<string, object>? details = null)
        : base(message, errorCode, innerException, details)
    {
    }
}

/// <summary>
/// Exception for resource not found errors
/// </summary>
public class ResourceNotFoundException : ApplicationException
{
    public string ResourceName { get; set; }
    public string ResourceId { get; set; }

    public ResourceNotFoundException(string resourceName, string resourceId)
        : base($"{resourceName} with ID '{resourceId}' not found", "RESOURCE_NOT_FOUND")
    {
        ResourceName = resourceName;
        ResourceId = resourceId;
        Details = new Dictionary<string, object>
        {
            { "ResourceName", resourceName },
            { "ResourceId", resourceId }
        };
    }

    public ResourceNotFoundException(string resourceName, Guid resourceId)
        : this(resourceName, resourceId.ToString())
    {
    }
}

/// <summary>
/// Exception for duplicate resource errors
/// </summary>
public class DuplicateResourceException : ApplicationException
{
    public string ResourceName { get; set; }
    public string ResourceKey { get; set; }

    public DuplicateResourceException(string resourceName, string resourceKey, string? value = null)
        : base($"A {resourceName} with {resourceKey} '{value ?? "this value"}' already exists", "DUPLICATE_RESOURCE")
    {
        ResourceName = resourceName;
        ResourceKey = resourceKey;
        Details = new Dictionary<string, object>
        {
            { "ResourceName", resourceName },
            { "ResourceKey", resourceKey }
        };
    }
}

/// <summary>
/// Exception for unauthorized access
/// </summary>
public class UnauthorizedException : ApplicationException
{
    public UnauthorizedException(string message = "Unauthorized access", string errorCode = "UNAUTHORIZED")
        : base(message, errorCode)
    {
    }
}

/// <summary>
/// Exception for forbidden access
/// </summary>
public class ForbiddenException : ApplicationException
{
    public ForbiddenException(string message = "Access forbidden", string errorCode = "FORBIDDEN")
        : base(message, errorCode)
    {
    }
}

/// <summary>
/// Exception for conflict errors (e.g., resource already booked)
/// </summary>
public class ConflictException : ApplicationException
{
    public ConflictException(string message, string errorCode = "CONFLICT", Dictionary<string, object>? details = null)
        : base(message, errorCode, null, details)
    {
    }
}

/// <summary>
/// Exception for database operations
/// </summary>
public class DatabaseException : ApplicationException
{
    public DatabaseException(string message, string errorCode = "DATABASE_ERROR", Exception? innerException = null)
        : base(message, errorCode, innerException)
    {
    }
}

/// <summary>
/// Exception for external service errors
/// </summary>
public class ExternalServiceException : ApplicationException
{
    public string ServiceName { get; set; }

    public ExternalServiceException(string serviceName, string message, string errorCode = "EXTERNAL_SERVICE_ERROR", Exception? innerException = null)
        : base(message, errorCode, innerException)
    {
        ServiceName = serviceName;
        Details = new Dictionary<string, object>
        {
            { "ServiceName", serviceName }
        };
    }
}

/// <summary>
/// Exception for operation timeout
/// </summary>
public class OperationTimeoutException : ApplicationException
{
    public OperationTimeoutException(string operationName, int timeoutMs)
        : base($"Operation '{operationName}' exceeded timeout of {timeoutMs}ms", "OPERATION_TIMEOUT")
    {
        Details = new Dictionary<string, object>
        {
            { "OperationName", operationName },
            { "TimeoutMs", timeoutMs }
        };
    }
}

/// <summary>
/// Exception for invalid operation state
/// </summary>
public class InvalidOperationStateException : ApplicationException
{
    public string CurrentState { get; set; }
    public string RequestedOperation { get; set; }

    public InvalidOperationStateException(string currentState, string requestedOperation)
        : base($"Cannot perform '{requestedOperation}' in current state '{currentState}'", "INVALID_OPERATION_STATE")
    {
        CurrentState = currentState;
        RequestedOperation = requestedOperation;
        Details = new Dictionary<string, object>
        {
            { "CurrentState", currentState },
            { "RequestedOperation", requestedOperation }
        };
    }
}
