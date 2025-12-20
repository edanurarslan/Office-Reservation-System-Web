namespace OfisYonetimSistemi.Application.DTOs;

/// <summary>
/// DTO for check-out operation
/// </summary>
public class CheckOutDto
{
    public string? DeviceInfo { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for check-out response
/// </summary>
public class CheckOutResultDto
{
    public Guid ReservationId { get; set; }
    public DateTime CheckOutAt { get; set; }
    public int DurationMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// DTO for getting check-in duration
/// </summary>
public class DurationResponseDto
{
    public Guid ReservationId { get; set; }
    public DateTime CheckInAt { get; set; }
    public int DurationMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
}
