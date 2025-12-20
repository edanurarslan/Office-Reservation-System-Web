namespace OfisYonetimSistemi.Application.DTOs;

/// <summary>
/// DTO for creating a new reservation
/// </summary>
public class CreateReservationDto
{
    public string ResourceType { get; set; } = string.Empty; // "desk" or "room"
    public Guid ResourceId { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public string? Notes { get; set; }
    public string? Purpose { get; set; }
    public int? ExpectedAttendees { get; set; }
    public bool IsRecurring { get; set; } = false;
    public string? RecurrencePattern { get; set; }
}

/// <summary>
/// DTO for updating an existing reservation
/// </summary>
public class UpdateReservationDto
{
    public string? ResourceType { get; set; }
    public Guid? ResourceId { get; set; }
    public DateTime? StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }
    public string? Notes { get; set; }
    public string? Purpose { get; set; }
    public int? ExpectedAttendees { get; set; }
}

/// <summary>
/// DTO for cancelling a reservation
/// </summary>
public class CancelReservationDto
{
    public string? CancellationReason { get; set; }
}

/// <summary>
/// DTO for reservation response
/// </summary>
public class ReservationDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string ResourceType { get; set; } = string.Empty;
    public Guid ResourceId { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? Purpose { get; set; }
    public int? ExpectedAttendees { get; set; }
    public DateTime? CheckInAt { get; set; }
    public DateTime? CheckOutAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
