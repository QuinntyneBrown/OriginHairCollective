using OriginHairCollective.Content.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Content.Infrastructure.Data;

public sealed class ContentDbContext(DbContextOptions<ContentDbContext> options) : DbContext(options)
{
    public DbSet<ContentPage> Pages => Set<ContentPage>();
    public DbSet<FaqItem> Faqs => Set<FaqItem>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<GalleryImage> GalleryImages => Set<GalleryImage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ContentPage>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Slug).HasMaxLength(200).IsRequired();
            e.Property(p => p.Title).HasMaxLength(300).IsRequired();
            e.Property(p => p.Body).IsRequired();
            e.HasIndex(p => p.Slug).IsUnique();
        });

        modelBuilder.Entity<FaqItem>(e =>
        {
            e.HasKey(f => f.Id);
            e.Property(f => f.Question).HasMaxLength(500).IsRequired();
            e.Property(f => f.Answer).HasMaxLength(2000).IsRequired();
            e.Property(f => f.Category).HasMaxLength(100).IsRequired();
        });

        modelBuilder.Entity<Testimonial>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.CustomerName).HasMaxLength(200).IsRequired();
            e.Property(t => t.CustomerLocation).HasMaxLength(200);
            e.Property(t => t.Content).HasMaxLength(2000).IsRequired();
            e.Property(t => t.ImageUrl).HasMaxLength(500);
        });

        modelBuilder.Entity<GalleryImage>(e =>
        {
            e.HasKey(g => g.Id);
            e.Property(g => g.Title).HasMaxLength(200).IsRequired();
            e.Property(g => g.Description).HasMaxLength(500);
            e.Property(g => g.ImageUrl).HasMaxLength(500).IsRequired();
            e.Property(g => g.Category).HasMaxLength(100).IsRequired();
        });
    }
}
