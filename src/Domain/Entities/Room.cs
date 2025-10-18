using OfisYonetimSistemi.Domain.Common;

namespace OfisYonetimSistemi.Domain.Entities;

public class Room : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Capacity { get; set; }
    public bool IsActive { get; set; } = true;
    public bool HasProjector { get; set; } = false;
    public bool HasWhiteboard { get; set; } = false;
    public bool HasVideoConference { get; set; } = false;
    public bool HasAirConditioning { get; set; } = false;
    public string? Equipment { get; set; } // JSON array of additional equipment
    public string RoomType { get; set; } = "meeting"; // "meeting", "phone_booth", "conference", etc.
    public Guid LocationId { get; set; }
    
    // Navigation properties
    public Location Location { get; set; } = null!;
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}