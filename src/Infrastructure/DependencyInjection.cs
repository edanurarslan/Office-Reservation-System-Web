using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using OfisYonetimSistemi.Application.Services;
using OfisYonetimSistemi.Infrastructure.Authentication;
using OfisYonetimSistemi.Infrastructure.Data;
using OfisYonetimSistemi.Infrastructure.Services;
using System.Text;

namespace OfisYonetimSistemi.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // JWT Settings
        var jwtSettings = new JwtSettings();
        configuration.Bind(JwtSettings.SectionName, jwtSettings);
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.AddSingleton<IJwtTokenService, JwtTokenService>();

        // Authentication & Authorization
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidAudience = jwtSettings.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
                ClockSkew = TimeSpan.FromMinutes(2)
            };

            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                    {
                        context.Response.Headers["Token-Expired"] = "true";
                    }
                    return Task.CompletedTask;
                }
            };
        });

        services.AddAuthorization(AuthorizationPolicies.AddPolicies);


    // Phase 1.2 Services
    services.AddScoped<ICheckOutService, CheckOutService>();
    services.AddScoped<IOccupancyAnalyticsService, OccupancyAnalyticsService>();
    services.AddHostedService<AutoCheckOutHostedService>();

    // Custom Services
    services.AddScoped<INotificationsService, NotificationsService>();
    services.AddScoped<ISupportRequestService, SupportRequestService>();

    // Phase 3 Services
    services.AddScoped<IHeatMapService, HeatMapService>();
    services.AddScoped<IFloorPlanService, FloorPlanService>();
    services.AddScoped<IRulesEngineService, RulesEngineService>();
    services.AddScoped<IFileStorageService, LocalFileStorageService>();
    services.AddScoped<INoShowCleanupService, NoShowCleanupService>();

        // Database
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"),
                npgsqlOptions =>
                {
                    npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorCodesToAdd: null);
                });

            // Enable sensitive data logging only in development
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
            {
                options.EnableSensitiveDataLogging();
            }
        });

        // Health checks
        services.AddHealthChecks()
            .AddDbContextCheck<ApplicationDbContext>("database");

        return services;
    }
}