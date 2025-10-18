namespace OfisYonetimSistemi.Domain.Enums;

public enum UserRole
{
    Employee = 1,
    Manager = 2,
    Admin = 3
}

public enum ReservationStatus
{
    Pending = 1,
    Confirmed = 2,
    CheckedIn = 3,
    Completed = 4,
    Cancelled = 5,
    NoShow = 6
}

public enum ResourceType
{
    Desk = 1,
    Room = 2
}

public enum CheckInType
{
    CheckIn = 1,
    CheckOut = 2
}

public enum QrTokenStatus
{
    Active = 1,
    Used = 2,
    Expired = 3
}

public enum RuleType
{
    Capacity = 1,
    NoShow = 2,
    Booking = 3,
    WorkingHours = 4
}