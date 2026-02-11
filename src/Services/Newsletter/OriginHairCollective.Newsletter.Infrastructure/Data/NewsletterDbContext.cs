using OriginHairCollective.Newsletter.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Newsletter.Infrastructure.Data;

public sealed class NewsletterDbContext(DbContextOptions<NewsletterDbContext> options) : DbContext(options)
{
    public DbSet<Subscriber> Subscribers => Set<Subscriber>();
    public DbSet<SubscriberTag> SubscriberTags => Set<SubscriberTag>();
    public DbSet<Campaign> Campaigns => Set<Campaign>();
    public DbSet<CampaignRecipient> CampaignRecipients => Set<CampaignRecipient>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Subscriber>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.Email).HasMaxLength(300).IsRequired();
            e.HasIndex(s => s.Email).IsUnique();
            e.Property(s => s.FirstName).HasMaxLength(200);
            e.Property(s => s.LastName).HasMaxLength(200);
            e.HasIndex(s => s.UserId);
            e.Property(s => s.ConfirmationToken).HasMaxLength(100);
            e.Property(s => s.UnsubscribeToken).HasMaxLength(100);
            e.HasIndex(s => s.UnsubscribeToken).IsUnique().HasFilter("UnsubscribeToken IS NOT NULL");
            e.HasMany(s => s.Tags).WithOne().HasForeignKey(t => t.SubscriberId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SubscriberTag>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Tag).HasMaxLength(100).IsRequired();
            e.HasIndex(t => t.SubscriberId);
            e.HasIndex(t => new { t.SubscriberId, t.Tag }).IsUnique();
        });

        modelBuilder.Entity<Campaign>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Subject).HasMaxLength(500).IsRequired();
            e.Property(c => c.HtmlBody).IsRequired();
            e.Property(c => c.TargetTag).HasMaxLength(100);
        });

        modelBuilder.Entity<CampaignRecipient>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Email).HasMaxLength(300).IsRequired();
            e.HasIndex(r => r.CampaignId);
            e.HasIndex(r => new { r.CampaignId, r.SubscriberId }).IsUnique();
        });
    }
}
