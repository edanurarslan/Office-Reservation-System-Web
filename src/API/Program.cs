using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfisYonetimSistemi.Infrastructure.Data;
using OfisYonetimSistemi.Domain.Entities;
using OfisYonetimSistemi.Domain.Enums;
using Microsoft.OpenApi.Models;
using OfisYonetimSistemi.Infrastructure;
using OfisYonetimSistemi.Application;
using OfisYonetimSistemi.API.Filters;
using OfisYonetimSistemi.API.Middleware;

var builder = WebApplication.CreateBuilder(args);
// Add DbContext for PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services to the container
builder.Services
    .AddControllers(options =>
    {
        options.Filters.Add<ValidationFilter>();
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.SuppressModelStateInvalidFilter = false;
    });

// Add application layer services (MediatR, FluentValidation, etc.)
builder.Services.AddApplication();

// Add infrastructure services
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Ofis Yönetim Sistemi API", Version = "v1" });
    
    // JWT Authentication için Swagger ayarı
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

// CORS policy for React app
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
    // CORS policy for Flutter web
    options.AddPolicy("AllowFlutterWeb", policy =>
    {
        policy.WithOrigins("http://localhost:8080")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add HttpContextAccessor for AuditLogService
builder.Services.AddHttpContextAccessor();

// Add AuditLog Service
builder.Services.AddScoped<OfisYonetimSistemi.Infrastructure.Services.IAuditLogService, OfisYonetimSistemi.Infrastructure.Services.AuditLogService>();

// TEMP: Allow all origins for debugging CORS issues
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


var app = builder.Build();

// Enable Swagger middleware
app.UseSwagger();
app.UseSwaggerUI();

// Add middleware pipeline
app.UseExceptionHandling();
app.UseRouting();
// TEMP: Use AllowAll CORS policy for debugging
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Seed admin user (simple hash, replace with real hash in production)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    if (!db.Users.Any(u => u.Email == "admin@example.com"))
    {
        db.Users.Add(new User
        {
            Email = "admin@example.com",
            FirstName = "Admin",
            LastName = "User",
            Role = UserRole.Admin,
            IsActive = true,
            PasswordHash = "eda12" // NOT SECURE: Replace with hash in production
        });
        db.SaveChanges();
    }

    // Seed manager user
    if (!db.Users.Any(u => u.Email == "manager@ofis.com"))
    {
        db.Users.Add(new User
        {
            Email = "manager@ofis.com",
            FirstName = "Manager",
            LastName = "User",
            Role = UserRole.Manager,
            IsActive = true,
            PasswordHash = "ofis123" // NOT SECURE: Replace with hash in production
        });
        db.SaveChanges();
    }
}

app.Run();
