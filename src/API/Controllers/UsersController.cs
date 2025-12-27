using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;
using OfisYonetimSistemi.Infrastructure.Services;

namespace OfisYonetimSistemi.API.Controllers;

[ApiController]
[Route("api/v1/users")]
[AllowAnonymous] // TODO: Production'da kaldırılmalı
public class UsersController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IAuditLogService auditLogService, ILogger<UsersController> logger)
    {
        _auditLogService = auditLogService;
        _logger = logger;
    }

    /// <summary>
    /// Tüm aktif kullanıcıları listeler.
    /// </summary>
    /// <returns>Kullanıcı listesi</returns>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<object>), 200)]
    [Produces("application/json")]
    [SwaggerOperation(Summary = "Tüm kullanıcıları getir", Description = "Sistemdeki tüm aktif kullanıcıları listeler.")]
    public async Task<IActionResult> GetUsers(
        [FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db,
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var query = db.Users.AsQueryable();

            // Arama filtresi
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(u => 
                    u.FirstName.ToLower().Contains(search) ||
                    u.LastName.ToLower().Contains(search) ||
                    u.Email.ToLower().Contains(search) ||
                    (u.Department != null && u.Department.ToLower().Contains(search)));
            }

            // Rol filtresi
            if (!string.IsNullOrEmpty(role) && Enum.TryParse<OfisYonetimSistemi.Domain.Enums.UserRole>(role, true, out var roleEnum))
            {
                query = query.Where(u => u.Role == roleEnum);
            }

            // Durum filtresi
            if (!string.IsNullOrEmpty(status))
            {
                if (status.ToLower() == "active")
                    query = query.Where(u => u.IsActive);
                else if (status.ToLower() == "inactive")
                    query = query.Where(u => !u.IsActive);
            }
            else
            {
                // Varsayılan olarak sadece aktif kullanıcılar
                query = query.Where(u => u.IsActive);
            }

            var totalCount = await query.CountAsync();

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new {
                    u.Id,
                    Name = u.FirstName + " " + u.LastName,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    Role = u.Role.ToString(),
                    u.Department,
                    u.JobTitle,
                    u.PhoneNumber,
                    Status = u.IsActive ? "active" : "inactive",
                    JoinDate = u.CreatedAt
                }).ToListAsync();

            return Ok(new
            {
                data = users,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching users");
            return StatusCode(500, "Error fetching users");
        }
    }

    /// <summary>
    /// Kullanıcı detaylarını getirir.
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(object), 200)]
    [Produces("application/json")]
    [SwaggerOperation(Summary = "Kullanıcı detay", Description = "Belirli bir kullanıcının detaylarını getirir.")]
    public async Task<IActionResult> GetUser([FromServices] OfisYonetimSistemi.Infrastructure.Data.ApplicationDbContext db, [FromRoute] Guid id)
    {
        var user = await db.Users
            .Where(u => u.Id == id)
            .Select(u => new {
                u.Id,
                Name = u.FirstName + " " + u.LastName,
                u.FirstName,
                u.LastName,
                u.Email,
                Role = u.Role.ToString(),
                u.Department,
                u.JobTitle,
                u.PhoneNumber,
                Status = u.IsActive ? "active" : "inactive",
                JoinDate = u.CreatedAt
            }).FirstOrDefaultAsync();

        if (user == null)
            return NotFound("User not found");

        return Ok(user);
    }

    /// <summary>
    /// Rolleri listeler.
    /// </summary>
    [HttpGet("roles")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<object>), 200)]
    [Produces("application/json")]
    [SwaggerOperation(Summary = "Rolleri getir", Description = "Sistemdeki tüm rolleri listeler.")]
    public IActionResult GetRoles()
    {
        var roles = Enum.GetValues<OfisYonetimSistemi.Domain.Enums.UserRole>()
            .Select(r => new { 
                Value = r.ToString(), 
                Label = r switch
                {
                    OfisYonetimSistemi.Domain.Enums.UserRole.Admin => "Yönetici",
                    OfisYonetimSistemi.Domain.Enums.UserRole.Manager => "Müdür",
                    OfisYonetimSistemi.Domain.Enums.UserRole.Employee => "Çalışan",
                    _ => r.ToString()
                }
            }).ToList();

        return Ok(roles);
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
        try
        {
            // Email kontrolü
            var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
                return BadRequest("Bu e-posta adresi zaten kullanılıyor");

            // İsim ayrıştırma
            var nameParts = request.Name.Split(' ', 2);
            var firstName = nameParts[0];
            var lastName = nameParts.Length > 1 ? nameParts[1] : "";

            // Şifre hashleme
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password ?? "123456");

            var user = new OfisYonetimSistemi.Domain.Entities.User
            {
                Id = Guid.NewGuid(),
                FirstName = firstName,
                LastName = lastName,
                Email = request.Email,
                Role = Enum.TryParse<OfisYonetimSistemi.Domain.Enums.UserRole>(request.Role, true, out var role) ? role : OfisYonetimSistemi.Domain.Enums.UserRole.Employee,
                IsActive = true,
                Department = request.Department,
                JobTitle = request.JobTitle,
                PhoneNumber = request.PhoneNumber,
                PasswordHash = passwordHash
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();

            await _auditLogService.LogAsync(
                "CREATE", 
                "User", 
                user.Id, 
                $"Yeni kullanıcı oluşturuldu: {user.Email}",
                null, 
                System.Text.Json.JsonSerializer.Serialize(new { user.FirstName, user.LastName, user.Email, Role = user.Role.ToString(), user.Department })
            );

            return Ok(new { 
                user.Id, 
                Name = user.FirstName + " " + user.LastName, 
                user.FirstName,
                user.LastName,
                user.Email, 
                Role = user.Role.ToString(),
                user.Department,
                user.JobTitle,
                Status = "active",
                JoinDate = user.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, "Error creating user");
        }
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
        try
        {
            var user = await db.Users.FindAsync(id);
            if (user == null)
                return NotFound("User not found");
            
            var oldValues = new { 
                user.FirstName, 
                user.LastName, 
                user.Email, 
                Role = user.Role.ToString(),
                user.Department,
                user.JobTitle,
                user.IsActive
            };
            
            if (!string.IsNullOrEmpty(request.Name))
            {
                var nameParts = request.Name.Split(' ', 2);
                user.FirstName = nameParts[0];
                user.LastName = nameParts.Length > 1 ? nameParts[1] : "";
            }
            if (!string.IsNullOrEmpty(request.FirstName)) user.FirstName = request.FirstName;
            if (!string.IsNullOrEmpty(request.LastName)) user.LastName = request.LastName;
            if (!string.IsNullOrEmpty(request.Email)) user.Email = request.Email;
            if (!string.IsNullOrEmpty(request.Role) && Enum.TryParse<OfisYonetimSistemi.Domain.Enums.UserRole>(request.Role, true, out var role)) user.Role = role;
            if (request.Department != null) user.Department = request.Department;
            if (request.JobTitle != null) user.JobTitle = request.JobTitle;
            if (request.PhoneNumber != null) user.PhoneNumber = request.PhoneNumber;
            if (request.IsActive.HasValue) user.IsActive = request.IsActive.Value;
            
            // Şifre güncelleme
            if (!string.IsNullOrEmpty(request.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            await db.SaveChangesAsync();

            var newValues = new { 
                user.FirstName, 
                user.LastName, 
                user.Email, 
                Role = user.Role.ToString(),
                user.Department,
                user.JobTitle,
                user.IsActive
            };

            await _auditLogService.LogAsync(
                "UPDATE", 
                "User", 
                user.Id, 
                $"Kullanıcı güncellendi: {user.Email}",
                System.Text.Json.JsonSerializer.Serialize(oldValues), 
                System.Text.Json.JsonSerializer.Serialize(newValues)
            );

            return Ok(new { 
                user.Id, 
                Name = user.FirstName + " " + user.LastName, 
                user.FirstName,
                user.LastName,
                user.Email, 
                Role = user.Role.ToString(),
                user.Department,
                user.JobTitle,
                Status = user.IsActive ? "active" : "inactive",
                JoinDate = user.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, "Error updating user");
        }
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
        try
        {
            var user = await db.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return NotFound("User not found");

            var deletedUserInfo = new { user.FirstName, user.LastName, user.Email, Role = user.Role.ToString() };
            var oldEmail = user.Email;
            
            user.IsActive = false;
            user.IsDeleted = true;
            user.DeletedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();

            await _auditLogService.LogAsync(
                "DELETE", 
                "User", 
                user.Id, 
                $"Kullanıcı silindi: {oldEmail}",
                System.Text.Json.JsonSerializer.Serialize(deletedUserInfo), 
                null
            );

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, "Error deleting user");
        }
    }
}

public class CreateUserRequest
{
    [Required]
    public string Name { get; set; } = default!;
    [Required]
    [EmailAddress]
    public string Email { get; set; } = default!;
    [Required]
    public string Role { get; set; } = default!;
    public string? Password { get; set; }
    public string? Department { get; set; }
    public string? JobTitle { get; set; }
    public string? PhoneNumber { get; set; }
}

public class UpdateUserRequest
{
    public string? Name { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    [EmailAddress]
    public string? Email { get; set; }
    public string? Role { get; set; }
    public string? Password { get; set; }
    public string? Department { get; set; }
    public string? JobTitle { get; set; }
    public string? PhoneNumber { get; set; }
    public bool? IsActive { get; set; }
}
