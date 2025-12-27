using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfisYonetimSistemi.API.Dtos;
using OfisYonetimSistemi.Application.Services;
using OfisYonetimSistemi.Infrastructure.Services;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OfisYonetimSistemi.API.Controllers
{
    [ApiController]
    [Route("api/v1/support")]
    public class SupportController : ControllerBase
    {
        private readonly ISupportRequestService _supportRequestService;
        private readonly INotificationsService _notificationsService;

        public SupportController(ISupportRequestService supportRequestService, INotificationsService notificationsService)
        {
            _supportRequestService = supportRequestService;
            _notificationsService = notificationsService;
        }

        [HttpPost("request")]
        [Authorize(Roles = "Employee")]
        public async Task<IActionResult> CreateSupportRequest([FromBody] SupportRequestDto dto)
        {
            var employeeId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(employeeId))
                return Unauthorized();

            if (string.IsNullOrWhiteSpace(dto.Subject) || string.IsNullOrWhiteSpace(dto.Message))
                return BadRequest("Konu ve mesaj gereklidir.");

            var request = await _supportRequestService.CreateSupportRequestAsync(Guid.Parse(employeeId), dto.Subject, dto.Message);

            // Notify all admins (role 3 = Admin, if your system uses 3 for Admin)
            await _notificationsService.SendNotificationToRoleAsync(3, "Yeni Destek Talebi", $"{dto.Subject}: {dto.Message}");

            return Ok(request);
        }
    }
}