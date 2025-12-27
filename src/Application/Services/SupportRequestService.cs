using OfisYonetimSistemi.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OfisYonetimSistemi.Application.Services
{
    public class SupportRequestService : ISupportRequestService
    {
        private readonly List<SupportRequest> _supportRequests = new(); // Replace with DbContext in real app

        public async Task<SupportRequest> CreateSupportRequestAsync(Guid employeeId, string subject, string message)
        {
            var request = new SupportRequest
            {
                EmployeeId = employeeId,
                Subject = subject,
                Message = message,
                CreatedAt = DateTime.UtcNow
            };
            _supportRequests.Add(request);
            return await Task.FromResult(request);
        }

        public async Task<IEnumerable<SupportRequest>> GetAllSupportRequestsAsync()
        {
            return await Task.FromResult(_supportRequests.AsEnumerable());
        }
    }
}