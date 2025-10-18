using OfisYonetimSistemi.Domain.Common;

namespace OfisYonetimSistemi.Domain.Entities;

public class Floor : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public int FloorNumber { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public string? FloorPlanImageUrl { get; set; }
    public Guid LocationId { get; set; }
    
    // Navigation properties
    public Location Location { get; set; } = null!;
    public ICollection<Zone> Zones { get; set; } = new List<Zone>();
}