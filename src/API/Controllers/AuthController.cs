using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OfisYonetimSistemi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using OfisYonetimSistemi.Domain.Enums;
using OfisYonetimSistemi.Infrastructure.Authentication;
using OfisYonetimSistemi.Infrastructure.Services;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IAuditLogService _auditLogService;

    public AuthController(IJwtTokenService jwtTokenService, IAuditLogService auditLogService)
    {
        _jwtTokenService = jwtTokenService;
        _auditLogService = auditLogService;
    }


    [HttpPost("login")]
    public async Task<IActionResult> Login([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { Error = "Email and password required" });

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);
        if (user == null)
        {
            // Log failed login attempt (user not found)
            await _auditLogService.LogAsync("LOGIN_FAILED", "User", null, null, null, $"Kullanıcı bulunamadı: {request.Email}");
            return Unauthorized(new { Error = "Invalid credentials" });
        }

        // BCrypt hash kontrolü
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            // Log failed login attempt (wrong password)
            await _auditLogService.LogLoginAsync(user.Id, false, "Yanlış şifre");
            return Unauthorized(new { Error = "Invalid credentials" });
        }

        // Log successful login
        await _auditLogService.LogLoginAsync(user.Id, true);

        var token = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        string roleString = user.Role switch
        {
            UserRole.Employee => "employee",
            UserRole.Manager => "manager",
            UserRole.Admin => "admin",
            _ => "employee"
        };

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
                Role = roleString,
                user.Department,
                user.JobTitle
            }
        });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
        {
            await _auditLogService.LogLogoutAsync(userId);
        }
        return Ok(new { message = "Çıkış yapıldı" });
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

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> Profile([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized();

        var user = await db.Users.FindAsync(userId);
        if (user == null)
            return NotFound();

        return Ok(new {
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role,
            user.Department,
            user.JobTitle
        });
    }
}

public record LoginRequest(string Email, string Password);
public record RefreshTokenRequest(string RefreshToken);

public record ValidateTokenRequest(string Token);