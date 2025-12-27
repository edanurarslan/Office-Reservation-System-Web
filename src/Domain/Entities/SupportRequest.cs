using System;

namespace OfisYonetimSistemi.Domain.Entities
{
    public class SupportRequest
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Subject { get; set; }
        public string Message { get; set; }
        public Guid EmployeeId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}