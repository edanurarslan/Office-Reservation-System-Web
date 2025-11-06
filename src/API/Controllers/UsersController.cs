using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/users")]
public class UsersController : ControllerBase
{
    /// <summary>
    /// Tüm aktif kullanıcıları listeler.
    /// </summary>
    /// <returns>Kullanıcı listesi</returns>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<object>), 200)]
    [Produces("application/json")]
    [SwaggerOperation(Summary = "Tüm kullanıcıları getir", Description = "Sistemdeki tüm aktif kullanıcıları listeler.")]
    public async Task<IActionResult> GetUsers([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db)
    {
        var users = await db.Users.Where(u => u.IsActive).Select(u => new {
            u.Id,
            Name = u.FirstName + " " + u.LastName,
            u.Email,
            u.Role
        }).ToListAsync();
        return Ok(users);
    }

    /// <summary>
    /// Yeni kullanıcı oluşturur.
    /// </summary>
    /// <param name="request">Kullanıcı bilgileri</param>
    /// <returns>Oluşturulan kullanıcı</returns>
    [HttpPost]
    [Authorize(Policy = "RequireManagerRole")]
    [ProducesResponseType(typeof(object), 200)]
    [Produces("application/json")]
    [SwaggerOperation(Summary = "Kullanıcı oluştur", Description = "Yeni bir kullanıcı ekler.")]
    public async Task<IActionResult> CreateUser([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromBody] CreateUserRequest request)
    {
        var user = new OfisYonetimSistemi.Domain.Entities.User
        {
            Id = Guid.NewGuid(),
            FirstName = request.Name,
            LastName = "",
            Email = request.Email,
            Role = Enum.TryParse<OfisYonetimSistemi.Domain.Enums.UserRole>(request.Role, out var role) ? role : OfisYonetimSistemi.Domain.Enums.UserRole.Employee,
            IsActive = true,
            PasswordHash = "123456" // Default, gerçek sistemde şifre alınmalı
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return Ok(new { user.Id, Name = user.FirstName, user.Email, user.Role });
    }

    /// <summary>
    /// Kullanıcı bilgilerini günceller.
    /// </summary>
    /// <param name="id">Kullanıcı ID</param>
    /// <param name="request">Güncellenecek bilgiler</param>
    /// <returns>Güncellenen kullanıcı</returns>
    [HttpPatch("{id}")]
    [Authorize(Policy = "RequireManagerRole")]
    [ProducesResponseType(typeof(object), 200)]
    [Produces("application/json")]
    [SwaggerOperation(Summary = "Kullanıcı güncelle", Description = "Mevcut bir kullanıcının bilgilerini günceller.")]
    public async Task<IActionResult> UpdateUser([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromRoute] Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await db.Users.FindAsync(id);
        if (user == null || !user.IsActive)
            return NotFound();
        if (!string.IsNullOrEmpty(request.Name)) user.FirstName = request.Name;
        if (!string.IsNullOrEmpty(request.Email)) user.Email = request.Email;
        if (!string.IsNullOrEmpty(request.Role) && Enum.TryParse<OfisYonetimSistemi.Domain.Enums.UserRole>(request.Role, out var role)) user.Role = role;
        await db.SaveChangesAsync();
        return Ok(new { user.Id, Name = user.FirstName, user.Email, user.Role });
    }

    /// <summary>
    /// Kullanıcıyı siler (soft delete).
    /// </summary>
    /// <param name="id">Kullanıcı ID</param>
    /// <returns>204 No Content</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = "RequireManagerRole")]
    [ProducesResponseType(204)]
    [SwaggerOperation(Summary = "Kullanıcı sil", Description = "Kullanıcıyı soft delete ile siler.")]
    public async Task<IActionResult> DeleteUser([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromRoute] Guid id)
    {
        var user = await db.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
            return NotFound();
        user.IsActive = false; // Soft delete
        user.IsDeleted = true; // BaseEntity soft delete flag
        user.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateUserRequest
{
    [Required]
    public string Name { get; set; } = default!;
    [Required]
    public string Email { get; set; } = default!;
    [Required]
    public string Role { get; set; } = default!;
}

public class UpdateUserRequest
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
}
