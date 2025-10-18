using OfisYonetimSistemi.Domain.Common;

namespace OfisYonetimSistemi.Domain.Entities;

public class Location : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? Description { get; set; }
    public string? TimeZone { get; set; } = "Europe/Istanbul";
    public bool IsActive { get; set; } = true;
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    
    // Navigation properties
    public ICollection<Floor> Floors { get; set; } = new List<Floor>();
    public ICollection<Room> Rooms { get; set; } = new List<Room>();
    public ICollection<Rule> Rules { get; set; } = new List<Rule>();
}