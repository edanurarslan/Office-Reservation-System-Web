using OfisYonetimSistemi.Domain.Entities;
using OfisYonetimSistemi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace OfisYonetimSistemi.Infrastructure.Services
{
    public class NotificationsService : INotificationsService
    {
        private readonly ApplicationDbContext _context;
        public NotificationsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SendNotificationToRoleAsync(int role, string title, string message)
        {
            var users = await _context.Users.Where(u => u.IsActive && (int)u.Role == role).ToListAsync();
            var notifications = users.Select(u => new Notification
            {
                UserId = u.Id,
                Title = title,
                Message = message,
                Type = "support",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            }).ToList();
            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();
        }
    }
}