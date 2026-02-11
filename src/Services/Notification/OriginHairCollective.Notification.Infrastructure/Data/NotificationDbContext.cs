using OriginHairCollective.Notification.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Notification.Infrastructure.Data;

public sealed class NotificationDbContext(DbContextOptions<NotificationDbContext> options) : DbContext(options)
{
    public DbSet<NotificationLog> NotificationLogs => Set<NotificationLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<NotificationLog>(e =>
        {
            e.HasKey(n => n.Id);
            e.Property(n => n.Recipient).HasMaxLength(300).IsRequired();
            e.Property(n => n.Subject).HasMaxLength(500).IsRequired();
            e.Property(n => n.Type).HasConversion<string>().HasMaxLength(50);
            e.Property(n => n.Channel).HasConversion<string>().HasMaxLength(50);
            e.Property(n => n.ErrorMessage).HasMaxLength(1000);
            e.HasIndex(n => n.Recipient);
        });
    }
}
