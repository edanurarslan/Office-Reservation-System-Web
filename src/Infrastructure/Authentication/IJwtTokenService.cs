using OfisYonetimSistemi.Domain.Entities;
using System.Security.Claims;

namespace OfisYonetimSistemi.Infrastructure.Authentication;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    bool ValidateToken(string token);
}