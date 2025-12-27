using Microsoft.EntityFrameworkCore;
using OfisYonetimSistemi.Domain.Entities;

namespace OfisYonetimSistemi.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Location> Locations { get; set; }
    public DbSet<Floor> Floors { get; set; }
    public DbSet<Zone> Zones { get; set; }
    public DbSet<Desk> Desks { get; set; }
    public DbSet<Room> Rooms { get; set; }
    public DbSet<Reservation> Reservations { get; set; }
    public DbSet<CheckIn> CheckIns { get; set; }
    public DbSet<QrToken> QrTokens { get; set; }
    public DbSet<Rule> Rules { get; set; }
    public DbSet<RuleAuditLog> RuleAuditLogs { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<FloorPlan> FloorPlans { get; set; }
    public DbSet<FloorPlanAnnotation> FloorPlanAnnotations { get; set; }
    public DbSet<NoShowHistory> NoShowHistories { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<ApprovalRequest> ApprovalRequests { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Update timestamps
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Modified)
            .Select(e => e.Entity)
            .OfType<Domain.Common.BaseEntity>();

        foreach (var entity in entries)
        {
            entity.UpdatedAt = DateTime.UtcNow;
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}