using Microsoft.AspNetCore.Authorization;
using OfisYonetimSistemi.Domain.Enums;

namespace OfisYonetimSistemi.Infrastructure.Authentication;

public static class AuthorizationPolicies
{
    public const string RequireEmployeeRole = "RequireEmployeeRole";
    public const string RequireManagerRole = "RequireManagerRole";
    public const string RequireAdminRole = "RequireAdminRole";
    public const string RequireManagerOrAdmin = "RequireManagerOrAdmin";

    public static void AddPolicies(AuthorizationOptions options)
    {
        options.AddPolicy(RequireEmployeeRole, policy =>
            policy.RequireRole(UserRole.Employee.ToString(), UserRole.Manager.ToString(), UserRole.Admin.ToString()));

        options.AddPolicy(RequireManagerRole, policy =>
            policy.RequireRole(UserRole.Manager.ToString(), UserRole.Admin.ToString()));

        options.AddPolicy(RequireAdminRole, policy =>
            policy.RequireRole(UserRole.Admin.ToString()));

        options.AddPolicy(RequireManagerOrAdmin, policy =>
            policy.RequireRole(UserRole.Manager.ToString(), UserRole.Admin.ToString()));
    }
}