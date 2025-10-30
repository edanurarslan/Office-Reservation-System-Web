using OfisYonetimSistemi.Domain.Common;
using OfisYonetimSistemi.Domain.Enums;

namespace OfisYonetimSistemi.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Department { get; set; }
    public string? JobTitle { get; set; }
    public UserRole Role { get; set; } = UserRole.Employee;
    public bool IsActive { get; set; } = true;
    public string? ExternalId { get; set; } // For OAuth integration
    public Guid? ManagerId { get; set; }

    // Password hash for authentication
    public string PasswordHash { get; set; } = string.Empty;

    // Navigation properties
    public User? Manager { get; set; }
    public ICollection<User> Subordinates { get; set; } = new List<User>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<CheckIn> CheckIns { get; set; } = new List<CheckIn>();
    public ICollection<QrToken> QrTokens { get; set; } = new List<QrToken>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}