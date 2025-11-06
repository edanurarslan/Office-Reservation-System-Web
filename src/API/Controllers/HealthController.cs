using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OfisYonetimSistemi.Infrastructure.Authentication;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { 
            Status = "Healthy", 
            Timestamp = DateTime.UtcNow,
            Version = "1.0.0",
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
        });
    }

    [HttpGet("auth")]
    [Authorize(Policy = AuthorizationPolicies.RequireEmployeeRole)]
    public IActionResult GetAuthorized()
    {
        return Ok(new { 
            Message = "You are authorized!", 
            User = User.Identity?.Name,
            Roles = User.Claims.Where(c => c.Type == "role" || c.Type == System.Security.Claims.ClaimTypes.Role)
                        .Select(c => c.Value)
        });
    }

    [HttpGet("admin")]
    [Authorize(Policy = AuthorizationPolicies.RequireAdminRole)]
    public IActionResult GetAdminOnly()
    {
        return Ok(new { 
            Message = "Admin access confirmed!", 
            User = User.Identity?.Name 
        });
    }
}