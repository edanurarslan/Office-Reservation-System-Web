using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OfisYonetimSistemi.Domain.Entities;

namespace OfisYonetimSistemi.Infrastructure.Data.Configurations;

public class FloorConfiguration : IEntityTypeConfiguration<Floor>
{
    public void Configure(EntityTypeBuilder<Floor> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Description).HasMaxLength(500);
        builder.Property(x => x.FloorPlanImageUrl).HasMaxLength(1000);

        builder.HasOne(x => x.Location)
            .WithMany(x => x.Floors)
            .HasForeignKey(x => x.LocationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.LocationId);
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}

public class ZoneConfiguration : IEntityTypeConfiguration<Zone>
{
    public void Configure(EntityTypeBuilder<Zone> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Description).HasMaxLength(500);
        builder.Property(x => x.ZoneType).IsRequired().HasMaxLength(50);

        builder.HasOne(x => x.Floor)
            .WithMany(x => x.Zones)
            .HasForeignKey(x => x.FloorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.FloorId);
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}

public class DeskConfiguration : IEntityTypeConfiguration<Desk>
{
    public void Configure(EntityTypeBuilder<Desk> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Description).HasMaxLength(500);
        builder.Property(x => x.Features).HasMaxLength(2000); // JSON
        builder.Property(x => x.XCoordinate).HasPrecision(10, 4);
        builder.Property(x => x.YCoordinate).HasPrecision(10, 4);

        builder.HasOne(x => x.Zone)
            .WithMany(x => x.Desks)
            .HasForeignKey(x => x.ZoneId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.ZoneId);
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}