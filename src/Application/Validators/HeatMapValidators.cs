using FluentValidation;
using OfisYonetimSistemi.Application.DTOs;

namespace OfisYonetimSistemi.Application.Validators;

/// <summary>
/// Validator for HeatMap query requests
/// </summary>
public class HeatMapQueryValidator : AbstractValidator<HeatMapQueryDto>
{
    public HeatMapQueryValidator()
    {
        // Optional LocationId validation
        RuleFor(x => x.LocationId)
            .NotEqual(Guid.Empty)
            .When(x => x.LocationId.HasValue)
            .WithMessage("Location ID must be a valid GUID");

        // Optional FloorId validation
        RuleFor(x => x.FloorId)
            .NotEqual(Guid.Empty)
            .When(x => x.FloorId.HasValue)
            .WithMessage("Floor ID must be a valid GUID");

        // Optional ZoneId validation
        RuleFor(x => x.ZoneId)
            .NotEqual(Guid.Empty)
            .When(x => x.ZoneId.HasValue)
            .WithMessage("Zone ID must be a valid GUID");

        // Period validation
        RuleFor(x => x.Period)
            .NotEmpty()
            .WithMessage("Period is required")
            .Must(x => IsValidPeriod(x))
            .WithMessage("Period must be one of: minute, hourly, daily");

        // ResourceType validation
        RuleFor(x => x.ResourceType)
            .NotEmpty()
            .WithMessage("Resource type is required")
            .Must(x => IsValidResourceType(x))
            .WithMessage("Resource type must be one of: desk, room, all");

        // Start and end time validation
        RuleFor(x => x.StartTime)
            .GreaterThan(DateTime.MinValue)
            .When(x => x.StartTime.HasValue)
            .WithMessage("Start time must be a valid date");

        RuleFor(x => x.EndTime)
            .GreaterThan(DateTime.MinValue)
            .When(x => x.EndTime.HasValue)
            .WithMessage("End time must be a valid date");

        // Validate that end time is after start time
        RuleFor(x => x)
            .Custom((x, context) =>
            {
                if (x.StartTime.HasValue && x.EndTime.HasValue && x.EndTime <= x.StartTime)
                {
                    context.AddFailure("EndTime", "End time must be after start time");
                }
            });

        // Validate that start time is not too far in the future
        RuleFor(x => x.StartTime)
            .LessThanOrEqualTo(DateTime.UtcNow.AddMonths(3))
            .When(x => x.StartTime.HasValue)
            .WithMessage("Start time cannot be more than 3 months in the future");

        // Validate time range is not too large
        RuleFor(x => x)
            .Custom((x, context) =>
            {
                if (x.StartTime.HasValue && x.EndTime.HasValue)
                {
                    var span = x.EndTime.Value - x.StartTime.Value;
                    if (span.TotalDays > 365)
                    {
                        context.AddFailure("DateRange", "Date range cannot exceed 365 days");
                    }
                }
            });

        // Optional DepartmentId validation
        RuleFor(x => x.DepartmentId)
            .NotEqual(Guid.Empty)
            .When(x => x.DepartmentId.HasValue)
            .WithMessage("Department ID must be a valid GUID");
    }

    private static bool IsValidPeriod(string period)
    {
        return period?.ToLowerInvariant() switch
        {
            "minute" => true,
            "hourly" => true,
            "daily" => true,
            _ => false
        };
    }

    private static bool IsValidResourceType(string resourceType)
    {
        return resourceType?.ToLowerInvariant() switch
        {
            "desk" => true,
            "room" => true,
            "all" => true,
            _ => false
        };
    }
}

/// <summary>
/// Validator for HeatMap configuration
/// </summary>
public class HeatMapConfigValidator : AbstractValidator<HeatMapConfigDto>
{
    public HeatMapConfigValidator()
    {
        // Validate thresholds
        RuleFor(x => x.MinOccupancyThreshold)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Minimum occupancy threshold must be >= 0")
            .LessThanOrEqualTo(100)
            .WithMessage("Minimum occupancy threshold must be <= 100");

        RuleFor(x => x.MaxOccupancyThreshold)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Maximum occupancy threshold must be >= 0")
            .LessThanOrEqualTo(100)
            .WithMessage("Maximum occupancy threshold must be <= 100");

        // Validate min < max
        RuleFor(x => x)
            .Custom((x, context) =>
            {
                if (x.MinOccupancyThreshold > x.MaxOccupancyThreshold)
                {
                    context.AddFailure("MinOccupancyThreshold", 
                        "Minimum threshold must be less than maximum threshold");
                }
            });

        // Update frequency validation
        RuleFor(x => x.UpdateFrequencySeconds)
            .GreaterThanOrEqualTo(5)
            .WithMessage("Update frequency must be at least 5 seconds")
            .LessThanOrEqualTo(300)
            .WithMessage("Update frequency cannot exceed 300 seconds");

        // Color scheme validation
        RuleFor(x => x.ColorScheme)
            .NotEmpty()
            .WithMessage("Color scheme is required")
            .Must(x => IsValidColorScheme(x))
            .WithMessage("Color scheme must be one of: heatmap, gradient, traffic_light");
    }

    private static bool IsValidColorScheme(string scheme)
    {
        return scheme?.ToLowerInvariant() switch
        {
            "heatmap" => true,
            "gradient" => true,
            "traffic_light" => true,
            _ => false
        };
    }
}

/// <summary>
/// Validator for zone-level detailed occupancy queries
/// </summary>
public class ZoneDetailedOccupancyValidator : AbstractValidator<ZoneDetailedOccupancyDto>
{
    public ZoneDetailedOccupancyValidator()
    {
        RuleFor(x => x.ZoneId)
            .NotEqual(Guid.Empty)
            .WithMessage("Zone ID must be a valid GUID");

        RuleFor(x => x.ZoneName)
            .NotEmpty()
            .WithMessage("Zone name is required")
            .MaximumLength(100)
            .WithMessage("Zone name cannot exceed 100 characters");

        RuleFor(x => x.ZoneDescription)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.ZoneDescription))
            .WithMessage("Zone description cannot exceed 500 characters");

        RuleFor(x => x.DeskDetails)
            .NotNull()
            .WithMessage("Desk details cannot be null");

        RuleFor(x => x.RoomDetails)
            .NotNull()
            .WithMessage("Room details cannot be null");
    }
}

/// <summary>
/// Validator for desk occupancy detail
/// </summary>
public class DeskDetailValidator : AbstractValidator<DeskDetailDto>
{
    public DeskDetailValidator()
    {
        RuleFor(x => x.DeskId)
            .NotEqual(Guid.Empty)
            .WithMessage("Desk ID must be a valid GUID");

        RuleFor(x => x.DeskName)
            .NotEmpty()
            .WithMessage("Desk name is required")
            .MaximumLength(50)
            .WithMessage("Desk name cannot exceed 50 characters");

        RuleFor(x => x.ReservationId)
            .NotEqual(Guid.Empty)
            .When(x => x.ReservationId.HasValue)
            .WithMessage("Reservation ID must be a valid GUID");

        RuleFor(x => x.CurrentUser)
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.CurrentUser))
            .WithMessage("Current user name cannot exceed 100 characters");

        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Status is required")
            .Must(x => IsValidDeskStatus(x))
            .WithMessage("Status must be one of: available, occupied, reserved, maintenance");

        RuleFor(x => x.ExpectedCheckOutTime)
            .GreaterThan(DateTime.UtcNow)
            .When(x => x.ExpectedCheckOutTime.HasValue)
            .WithMessage("Expected check-out time must be in the future");
    }

    private static bool IsValidDeskStatus(string status)
    {
        return status?.ToLowerInvariant() switch
        {
            "available" => true,
            "occupied" => true,
            "reserved" => true,
            "maintenance" => true,
            _ => false
        };
    }
}

/// <summary>
/// Validator for room occupancy detail
/// </summary>
public class RoomDetailValidator : AbstractValidator<RoomDetailDto>
{
    public RoomDetailValidator()
    {
        RuleFor(x => x.RoomId)
            .NotEqual(Guid.Empty)
            .WithMessage("Room ID must be a valid GUID");

        RuleFor(x => x.RoomName)
            .NotEmpty()
            .WithMessage("Room name is required")
            .MaximumLength(100)
            .WithMessage("Room name cannot exceed 100 characters");

        RuleFor(x => x.Capacity)
            .GreaterThan(0)
            .WithMessage("Room capacity must be greater than 0");

        RuleFor(x => x.CurrentOccupancy)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Current occupancy cannot be negative")
            .LessThanOrEqualTo(x => x.Capacity)
            .WithMessage("Current occupancy cannot exceed room capacity");

        RuleFor(x => x.OccupancyPercentage)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Occupancy percentage must be >= 0")
            .LessThanOrEqualTo(100)
            .WithMessage("Occupancy percentage must be <= 100");

        RuleFor(x => x.ReservationId)
            .NotEqual(Guid.Empty)
            .When(x => x.ReservationId.HasValue)
            .WithMessage("Reservation ID must be a valid GUID");

        RuleFor(x => x.OrganizerName)
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.OrganizerName))
            .WithMessage("Organizer name cannot exceed 100 characters");

        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Status is required")
            .Must(x => IsValidRoomStatus(x))
            .WithMessage("Status must be one of: available, occupied, reserved, blocked");

        RuleFor(x => x.ExpectedAvailableTime)
            .GreaterThan(DateTime.UtcNow)
            .When(x => x.ExpectedAvailableTime.HasValue)
            .WithMessage("Expected available time must be in the future");

        RuleFor(x => x.Equipment)
            .NotNull()
            .WithMessage("Equipment list cannot be null");
    }

    private static bool IsValidRoomStatus(string status)
    {
        return status?.ToLowerInvariant() switch
        {
            "available" => true,
            "occupied" => true,
            "reserved" => true,
            "blocked" => true,
            _ => false
        };
    }
}

/// <summary>
/// Validator for occupancy statistics
/// </summary>
public class OccupancyStatisticsValidator : AbstractValidator<OccupancyStatisticsDto>
{
    public OccupancyStatisticsValidator()
    {
        RuleFor(x => x.AverageOccupancy)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Average occupancy must be >= 0")
            .LessThanOrEqualTo(100)
            .WithMessage("Average occupancy must be <= 100");

        RuleFor(x => x.PeakOccupancy)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Peak occupancy must be >= 0")
            .LessThanOrEqualTo(100)
            .WithMessage("Peak occupancy must be <= 100");

        RuleFor(x => x.MinOccupancy)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Minimum occupancy must be >= 0")
            .LessThanOrEqualTo(100)
            .WithMessage("Minimum occupancy must be <= 100");

        RuleFor(x => x.PeakHour)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Peak hour must be >= 0")
            .LessThanOrEqualTo(23)
            .WithMessage("Peak hour must be <= 23");

        RuleFor(x => x.PeakDayOfWeek)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Peak day must be >= 0 (Sunday)")
            .LessThanOrEqualTo(6)
            .WithMessage("Peak day must be <= 6 (Saturday)");

        RuleFor(x => x.AverageDeskOccupancy)
            .GreaterThanOrEqualTo(0)
            .When(x => x.AverageDeskOccupancy.HasValue)
            .WithMessage("Average desk occupancy must be >= 0")
            .LessThanOrEqualTo(100)
            .When(x => x.AverageDeskOccupancy.HasValue)
            .WithMessage("Average desk occupancy must be <= 100");

        RuleFor(x => x.AverageRoomOccupancy)
            .GreaterThanOrEqualTo(0)
            .When(x => x.AverageRoomOccupancy.HasValue)
            .WithMessage("Average room occupancy must be >= 0")
            .LessThanOrEqualTo(100)
            .When(x => x.AverageRoomOccupancy.HasValue)
            .WithMessage("Average room occupancy must be <= 100");

        RuleFor(x => x.TotalReservations)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Total reservations cannot be negative");

        RuleFor(x => x.CompletedReservations)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Completed reservations cannot be negative")
            .LessThanOrEqualTo(x => x.TotalReservations)
            .WithMessage("Completed reservations cannot exceed total reservations");

        RuleFor(x => x.NoShowCount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("No-show count cannot be negative");

        RuleFor(x => x.CancellationCount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Cancellation count cannot be negative");
    }
}

/// <summary>
/// Validator for occupancy predictions
/// </summary>
public class OccupancyPredictionValidator : AbstractValidator<OccupancyPredictionDto>
{
    public OccupancyPredictionValidator()
    {
        RuleFor(x => x.PredictedTime)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("Predicted time must be in the future");

        RuleFor(x => x.PredictedOccupancy)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Predicted occupancy must be >= 0")
            .LessThanOrEqualTo(100)
            .WithMessage("Predicted occupancy must be <= 100");

        RuleFor(x => x.ConfidenceLevel)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Confidence level must be >= 0")
            .LessThanOrEqualTo(100)
            .WithMessage("Confidence level must be <= 100");

        RuleFor(x => x.ExpectedAvailableDesks)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Expected available desks cannot be negative");

        RuleFor(x => x.ExpectedAvailableRooms)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Expected available rooms cannot be negative");

        RuleFor(x => x.ConfidenceFactors)
            .NotNull()
            .WithMessage("Confidence factors cannot be null");
    }
}
