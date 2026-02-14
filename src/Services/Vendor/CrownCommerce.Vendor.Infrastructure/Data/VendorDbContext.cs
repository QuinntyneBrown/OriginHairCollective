using CrownCommerce.Vendor.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace CrownCommerce.Vendor.Infrastructure.Data;

public sealed class VendorDbContext(DbContextOptions<VendorDbContext> options) : DbContext(options)
{
    public DbSet<Core.Entities.Vendor> Vendors => Set<Core.Entities.Vendor>();
    public DbSet<VendorScore> VendorScores => Set<VendorScore>();
    public DbSet<VendorRedFlag> VendorRedFlags => Set<VendorRedFlag>();
    public DbSet<VendorFollowUp> VendorFollowUps => Set<VendorFollowUp>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Core.Entities.Vendor>(e =>
        {
            e.HasKey(v => v.Id);
            e.Property(v => v.CompanyName).HasMaxLength(300).IsRequired();
            e.Property(v => v.ContactName).HasMaxLength(200).IsRequired();
            e.Property(v => v.ContactEmail).HasMaxLength(300).IsRequired();
            e.Property(v => v.ContactWhatsApp).HasMaxLength(50);
            e.Property(v => v.FactoryLocation).HasMaxLength(500);
            e.Property(v => v.WebsiteUrl).HasMaxLength(500);
            e.Property(v => v.EvaluatedBy).HasMaxLength(200);
            e.Property(v => v.Notes).HasMaxLength(2000);
            e.Property(v => v.Platform).HasConversion<string>().HasMaxLength(50);
            e.Property(v => v.HairOriginCountry).HasConversion<string>().HasMaxLength(50);
            e.Property(v => v.Status).HasConversion<string>().HasMaxLength(50);
            e.HasIndex(v => v.CompanyName);
            e.HasIndex(v => v.Status);
        });

        modelBuilder.Entity<VendorScore>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.CriterionNumber).HasMaxLength(10).IsRequired();
            e.Property(s => s.CriterionLabel).HasMaxLength(200).IsRequired();
            e.Property(s => s.Notes).HasMaxLength(1000);
            e.Property(s => s.Section).HasConversion<string>().HasMaxLength(50);
            e.HasOne(s => s.Vendor)
                .WithMany(v => v.Scores)
                .HasForeignKey(s => s.VendorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<VendorRedFlag>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Description).HasMaxLength(500).IsRequired();
            e.HasOne(r => r.Vendor)
                .WithMany(v => v.RedFlags)
                .HasForeignKey(r => r.VendorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<VendorFollowUp>(e =>
        {
            e.HasKey(f => f.Id);
            e.Property(f => f.Subject).HasMaxLength(500).IsRequired();
            e.Property(f => f.Body).HasMaxLength(5000).IsRequired();
            e.Property(f => f.ErrorMessage).HasMaxLength(1000);
            e.HasOne(f => f.Vendor)
                .WithMany(v => v.FollowUps)
                .HasForeignKey(f => f.VendorId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
