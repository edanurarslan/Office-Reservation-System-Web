using OfisYonetimSistemi.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OfisYonetimSistemi.Application.Services
{
    public interface ISupportRequestService
    {
        Task<SupportRequest> CreateSupportRequestAsync(Guid employeeId, string subject, string message);
        Task<IEnumerable<SupportRequest>> GetAllSupportRequestsAsync();
    }
}