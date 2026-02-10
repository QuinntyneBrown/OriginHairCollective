using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Inquiry.Infrastructure.Data;

public sealed class InquiryDbContext(DbContextOptions<InquiryDbContext> options) : DbContext(options)
{
    public DbSet<Core.Entities.Inquiry> Inquiries => Set<Core.Entities.Inquiry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Core.Entities.Inquiry>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.Name).HasMaxLength(200).IsRequired();
            e.Property(i => i.Email).HasMaxLength(300).IsRequired();
            e.Property(i => i.Phone).HasMaxLength(50);
            e.Property(i => i.Message).HasMaxLength(2000).IsRequired();
        });
    }
}
