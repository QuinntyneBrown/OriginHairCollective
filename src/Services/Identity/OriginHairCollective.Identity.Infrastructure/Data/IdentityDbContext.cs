using OriginHairCollective.Identity.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Identity.Infrastructure.Data;

public sealed class IdentityDbContext(DbContextOptions<IdentityDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Email).HasMaxLength(300).IsRequired();
            e.Property(u => u.PasswordHash).HasMaxLength(500).IsRequired();
            e.Property(u => u.FirstName).HasMaxLength(100).IsRequired();
            e.Property(u => u.LastName).HasMaxLength(100).IsRequired();
            e.Property(u => u.Phone).HasMaxLength(50);
            e.Property(u => u.Role).HasConversion<string>().HasMaxLength(50);
            e.HasIndex(u => u.Email).IsUnique();
        });
    }
}
