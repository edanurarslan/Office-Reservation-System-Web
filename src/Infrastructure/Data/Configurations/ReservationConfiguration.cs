using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OfisYonetimSistemi.Domain.Entities;
using OfisYonetimSistemi.Domain.Enums;

namespace OfisYonetimSistemi.Infrastructure.Data.Configurations;

public class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ResourceType)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(x => x.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.Property(x => x.Purpose)
            .HasMaxLength(500);

        builder.Property(x => x.CancellationReason)
            .HasMaxLength(500);

        builder.Property(x => x.RecurrencePattern)
            .HasMaxLength(2000); // JSON

        // Relationships
        builder.HasOne(x => x.User)
            .WithMany(x => x.Reservations)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Polymorphic relationship to Desk
        builder.HasOne(x => x.Desk)
            .WithMany(x => x.Reservations)
            .HasForeignKey(x => x.ResourceId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_Reservations_Desks");

        // Polymorphic relationship to Room
        builder.HasOne(x => x.Room)
            .WithMany(x => x.Reservations)
            .HasForeignKey(x => x.ResourceId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_Reservations_Rooms");

        // Self-referencing relationship for recurring reservations
        builder.HasOne(x => x.ParentReservation)
            .WithMany(x => x.ChildReservations)
            .HasForeignKey(x => x.ParentReservationId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => new { x.ResourceType, x.ResourceId });
        builder.HasIndex(x => new { x.StartsAt, x.EndsAt });
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.IsDeleted);

        // Complex index for conflict detection
        builder.HasIndex(x => new { x.ResourceType, x.ResourceId, x.StartsAt, x.EndsAt, x.Status })
            .HasDatabaseName("IX_Reservations_ConflictDetection");

        // Global query filter for soft delete
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}