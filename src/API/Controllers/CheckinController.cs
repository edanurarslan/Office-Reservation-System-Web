using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/checkin")]
public class CheckinController : ControllerBase
{
    // POST /qr-tokens
    [HttpPost("qr-tokens")]
    [Authorize]
    public IActionResult GenerateQrToken([FromBody] QrTokenRequest request)
    {
        var token = Guid.NewGuid().ToString();
        return Ok(new { token = token, expiresAt = DateTime.UtcNow.AddMinutes(15).ToString("o") });
    }

    // POST /checkins/scan
    [HttpPost("checkins/scan")]
    [Authorize]
    public IActionResult ScanCheckin([FromBody] ScanCheckinRequest request)
    {
        // Örnek doğrulama ve rezervasyon güncelleme
        bool isValid = true; // Gerçek doğrulama burada olmalı
        if (!isValid)
        {
            return BadRequest(new { error = new { code = "INVALID_TOKEN", message = "Token is invalid or expired" } });
        }
        return Ok(new { status = "checked_in", reservationId = "b6f2..." });
    }
}

public class QrTokenRequest
{
    [Required]
    public string UserId { get; set; } = default!;
    public string? ReservationId { get; set; }
}

public class ScanCheckinRequest
{
    [Required]
    public string Token { get; set; } = default!;
}
