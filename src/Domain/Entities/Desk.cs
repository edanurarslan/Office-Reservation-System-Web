using OfisYonetimSistemi.Domain.Common;

namespace OfisYonetimSistemi.Domain.Entities;

public class Desk : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public bool HasMonitor { get; set; } = false;
    public bool HasKeyboard { get; set; } = false;
    public bool HasMouse { get; set; } = false;
    public bool HasDockingStation { get; set; } = false;
    public string? Features { get; set; } // JSON array of additional features
    public decimal? XCoordinate { get; set; } // For floor plan positioning
    public decimal? YCoordinate { get; set; } // For floor plan positioning
    public Guid ZoneId { get; set; }
    
    // Navigation properties
    public Zone Zone { get; set; } = null!;
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}