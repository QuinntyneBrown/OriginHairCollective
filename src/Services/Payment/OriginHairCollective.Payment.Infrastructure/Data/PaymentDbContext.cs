using OriginHairCollective.Payment.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Payment.Infrastructure.Data;

public sealed class PaymentDbContext(DbContextOptions<PaymentDbContext> options) : DbContext(options)
{
    public DbSet<PaymentRecord> Payments => Set<PaymentRecord>();
    public DbSet<RefundRecord> Refunds => Set<RefundRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PaymentRecord>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.CustomerEmail).HasMaxLength(300).IsRequired();
            e.Property(p => p.Amount).HasColumnType("decimal(10,2)");
            e.Property(p => p.Method).HasConversion<string>().HasMaxLength(50);
            e.Property(p => p.Status).HasConversion<string>().HasMaxLength(50);
            e.Property(p => p.ExternalTransactionId).HasMaxLength(200);
            e.Property(p => p.FailureReason).HasMaxLength(500);
            e.HasIndex(p => p.OrderId);
        });

        modelBuilder.Entity<RefundRecord>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.CustomerEmail).HasMaxLength(300).IsRequired();
            e.Property(r => r.Amount).HasColumnType("decimal(10,2)");
            e.Property(r => r.Reason).HasMaxLength(500).IsRequired();
            e.HasOne(r => r.Payment)
                .WithMany()
                .HasForeignKey(r => r.PaymentId);
        });
    }
}
