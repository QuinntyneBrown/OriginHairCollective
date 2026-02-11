using OriginHairCollective.Order.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Order.Infrastructure.Data;

public sealed class OrderDbContext(DbContextOptions<OrderDbContext> options) : DbContext(options)
{
    public DbSet<CustomerOrder> Orders => Set<CustomerOrder>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<CartItem> CartItems => Set<CartItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CustomerOrder>(e =>
        {
            e.HasKey(o => o.Id);
            e.Property(o => o.CustomerEmail).HasMaxLength(300).IsRequired();
            e.Property(o => o.CustomerName).HasMaxLength(200).IsRequired();
            e.Property(o => o.ShippingAddress).HasMaxLength(500).IsRequired();
            e.Property(o => o.TrackingNumber).HasMaxLength(100);
            e.Property(o => o.Status).HasConversion<string>().HasMaxLength(50);
            e.Property(o => o.TotalAmount).HasColumnType("decimal(10,2)");
            e.HasMany(o => o.Items)
                .WithOne(i => i.Order)
                .HasForeignKey(i => i.OrderId);
        });

        modelBuilder.Entity<OrderItem>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.ProductName).HasMaxLength(200).IsRequired();
            e.Property(i => i.UnitPrice).HasColumnType("decimal(10,2)");
            e.Ignore(i => i.LineTotal);
        });

        modelBuilder.Entity<CartItem>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.SessionId).HasMaxLength(100).IsRequired();
            e.Property(c => c.ProductName).HasMaxLength(200).IsRequired();
            e.Property(c => c.UnitPrice).HasColumnType("decimal(10,2)");
            e.HasIndex(c => c.SessionId);
        });
    }
}
