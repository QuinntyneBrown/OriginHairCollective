using OriginHairCollective.Catalog.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Catalog.Infrastructure.Data;

public sealed class CatalogDbContext(DbContextOptions<CatalogDbContext> options) : DbContext(options)
{
    public DbSet<HairProduct> Products => Set<HairProduct>();
    public DbSet<HairOrigin> Origins => Set<HairOrigin>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<HairProduct>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Name).HasMaxLength(200).IsRequired();
            e.Property(p => p.Description).HasMaxLength(1000);
            e.Property(p => p.ImageUrl).HasMaxLength(500);
            e.Property(p => p.Price).HasColumnType("decimal(10,2)");
            e.Property(p => p.Texture).HasConversion<string>().HasMaxLength(50);
            e.Property(p => p.Type).HasConversion<string>().HasMaxLength(50);
            e.HasOne(p => p.Origin)
                .WithMany(o => o.Products)
                .HasForeignKey(p => p.OriginId);
        });

        modelBuilder.Entity<HairOrigin>(e =>
        {
            e.HasKey(o => o.Id);
            e.Property(o => o.Country).HasMaxLength(100).IsRequired();
            e.Property(o => o.Region).HasMaxLength(200).IsRequired();
            e.Property(o => o.Description).HasMaxLength(1000);
        });
    }
}
