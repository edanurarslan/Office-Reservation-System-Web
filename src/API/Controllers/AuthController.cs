using Microsoft.AspNetCore.Mvc;
using OfisYonetimSistemi.Domain.Entities;
using OfisYonetimSistemi.Domain.Enums;
using OfisYonetimSistemi.Infrastructure.Authentication;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IJwtTokenService _jwtTokenService;

    public AuthController(IJwtTokenService jwtTokenService)
    {
        _jwtTokenService = jwtTokenService;
    }

    [HttpPost("test-token")]
    public IActionResult GenerateTestToken([FromBody] TestTokenRequest request)
    {
        // Create a test user
        var testUser = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email ?? "test@company.com",
            FirstName = request.FirstName ?? "Test",
            LastName = request.LastName ?? "User",
            Role = request.Role ?? UserRole.Employee,
            Department = "IT",
            JobTitle = "Developer"
        };

        var token = _jwtTokenService.GenerateAccessToken(testUser);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        return Ok(new
        {
            AccessToken = token,
            RefreshToken = refreshToken,
            ExpiresIn = 3600, // 1 hour
            TokenType = "Bearer",
            User = new
            {
                testUser.Id,
                testUser.Email,
                testUser.FirstName,
                testUser.LastName,
                testUser.Role,
                testUser.Department,
                testUser.JobTitle
            }
        });
    }

    [HttpPost("validate-token")]
    public IActionResult ValidateToken([FromBody] ValidateTokenRequest request)
    {
        if (string.IsNullOrEmpty(request.Token))
        {
            return BadRequest(new { Error = "Token is required" });
        }

        var isValid = _jwtTokenService.ValidateToken(request.Token);
        
        return Ok(new { IsValid = isValid });
    }
}

public record TestTokenRequest(
    string? Email = null,
    string? FirstName = null,
    string? LastName = null,
    UserRole? Role = null
);

public record ValidateTokenRequest(string Token);