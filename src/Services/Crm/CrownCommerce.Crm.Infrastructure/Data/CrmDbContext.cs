using CrownCommerce.Crm.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace CrownCommerce.Crm.Infrastructure.Data;

public sealed class CrmDbContext : DbContext
{
    public CrmDbContext(DbContextOptions<CrmDbContext> options) : base(options)
    {
    }

    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<HairStylist> HairStylists => Set<HairStylist>();
    public DbSet<HairSalon> HairSalons => Set<HairSalon>();
    public DbSet<Interaction> Interactions => Set<Interaction>();
    public DbSet<FollowUp> FollowUps => Set<FollowUp>();
    public DbSet<ContactTag> ContactTags => Set<ContactTag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure table-per-hierarchy inheritance
        modelBuilder.Entity<Contact>()
            .HasDiscriminator<string>("ContactType")
            .HasValue<Customer>("Customer")
            .HasValue<Lead>("Lead")
            .HasValue<HairStylist>("HairStylist")
            .HasValue<HairSalon>("HairSalon");

        // Configure relationships
        modelBuilder.Entity<Contact>()
            .HasMany(c => c.Interactions)
            .WithOne(i => i.Contact)
            .HasForeignKey(i => i.ContactId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Contact>()
            .HasMany(c => c.FollowUps)
            .WithOne(f => f.Contact)
            .HasForeignKey(f => f.ContactId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Contact>()
            .HasMany(c => c.Tags)
            .WithOne()
            .HasForeignKey(t => t.ContactId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure HairSalon to HairStylist relationship
        modelBuilder.Entity<HairSalon>()
            .HasMany(s => s.Stylists)
            .WithOne()
            .HasForeignKey(st => st.SalonId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configure indexes
        modelBuilder.Entity<Contact>()
            .HasIndex(c => c.Email);

        modelBuilder.Entity<Contact>()
            .HasIndex(c => c.ContactType);

        modelBuilder.Entity<Interaction>()
            .HasIndex(i => i.ContactId);

        modelBuilder.Entity<Interaction>()
            .HasIndex(i => i.InteractionDate);

        modelBuilder.Entity<FollowUp>()
            .HasIndex(f => f.ContactId);

        modelBuilder.Entity<FollowUp>()
            .HasIndex(f => f.DueDate);

        modelBuilder.Entity<FollowUp>()
            .HasIndex(f => f.Status);

        modelBuilder.Entity<FollowUp>()
            .HasIndex(f => f.AssignedToUserId);

        modelBuilder.Entity<ContactTag>()
            .HasIndex(t => t.Tag);
    }
}
