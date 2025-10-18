using OfisYonetimSistemi.Domain.Common;

namespace OfisYonetimSistemi.Domain.Entities;

public class Zone : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ZoneType { get; set; } = string.Empty; // "open_office", "quiet_zone", "meeting_area", etc.
    public bool IsActive { get; set; } = true;
    public int? MaxCapacity { get; set; }
    public Guid FloorId { get; set; }
    
    // Navigation properties
    public Floor Floor { get; set; } = null!;
    public ICollection<Desk> Desks { get; set; } = new List<Desk>();
}