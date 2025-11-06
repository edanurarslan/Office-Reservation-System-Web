using Microsoft.AspNetCore.Mvc;
using OfisYonetimSistemi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using OfisYonetimSistemi.Domain.Enums;
using OfisYonetimSistemi.Infrastructure.Authentication;
using Swashbuckle.AspNetCore.Annotations;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IJwtTokenService _jwtTokenService;

    public AuthController(IJwtTokenService jwtTokenService)
    {
        _jwtTokenService = jwtTokenService;
    }


    [HttpPost("login")]
    public async Task<IActionResult> Login([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { Error = "Email and password required" });

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);
        if (user == null)
            return Unauthorized(new { Error = "Invalid credentials" });

        // Basit hash kontrolü (gerçek sistemde hash karşılaştırması yapılmalı)
        if (user.PasswordHash != request.Password)
            return Unauthorized(new { Error = "Invalid credentials" });

        var token = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        return Ok(new
        {
            AccessToken = token,
            RefreshToken = refreshToken,
            ExpiresIn = 3600,
            TokenType = "Bearer",
            User = new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.Role,
                user.Department,
                user.JobTitle
            }
        });
    }

    [HttpPost("refresh-token")]
    public IActionResult RefreshToken([FromBody] RefreshTokenRequest request)
    {
        // Gerçek sistemde refresh token doğrulama ve yeni access token üretimi yapılmalı
        // Burada örnek olarak yeni bir access token dönülüyor
        return Ok(new
        {
            AccessToken = _jwtTokenService.GenerateAccessToken(new User { Email = "demo@ofis.com", FirstName = "Demo", LastName = "User", Role = UserRole.Employee }),
            ExpiresIn = 3600,
            TokenType = "Bearer"
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


public record LoginRequest(string Email, string Password);
public record RefreshTokenRequest(string RefreshToken);

public record ValidateTokenRequest(string Token);