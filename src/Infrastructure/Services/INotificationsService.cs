using OfisYonetimSistemi.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace OfisYonetimSistemi.Infrastructure.Services
{
    public interface INotificationsService
    {
        Task SendNotificationToRoleAsync(int role, string title, string message);
    }
}