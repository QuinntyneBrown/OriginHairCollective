using OriginHairCollective.Content.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Content.Infrastructure.Data;

public static class ContentDbSeeder
{
    public static async Task SeedAsync(ContentDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Pages.AnyAsync())
            return;

        var pages = new List<ContentPage>
        {
            new()
            {
                Id = Guid.NewGuid(), Slug = "our-story", Title = "Our Story",
                Body = "Origin Hair Collective was founded with a mission to bring ethically sourced, premium quality hair extensions to conscious consumers. We partner directly with communities across Southeast Asia and South Asia to ensure fair-trade practices and full traceability from source to salon.",
                SortOrder = 1, IsPublished = true, CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(), Slug = "hair-care-guide", Title = "Hair Care Guide",
                Body = "Proper care extends the life of your hair extensions. Always use sulfate-free shampoo, detangle gently from ends to roots, and store on a silk or satin surface. Deep condition weekly and avoid excessive heat styling to maintain the natural luster and softness.",
                SortOrder = 2, IsPublished = true, CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(), Slug = "shipping-info", Title = "Shipping Information",
                Body = "We offer free standard shipping on orders over $150. Standard shipping takes 5-7 business days. Express shipping (2-3 business days) is available for $15. International shipping is available to select countries with delivery in 7-14 business days.",
                SortOrder = 3, IsPublished = true, CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(), Slug = "returns-policy", Title = "Returns Policy",
                Body = "We accept returns within 14 days of delivery for unopened, unused products in original packaging. Custom-colored or cut items are final sale. Contact our team to initiate a return and receive a prepaid shipping label.",
                SortOrder = 4, IsPublished = true, CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(), Slug = "ambassador-program", Title = "Ambassador Program",
                Body = "Join the Origin Hair Collective ambassador program and earn commissions while sharing products you love. Ambassadors receive exclusive discounts, early access to new collections, and personalized referral codes. Apply today to become part of our community.",
                SortOrder = 5, IsPublished = true, CreatedAt = DateTime.UtcNow
            }
        };

        context.Pages.AddRange(pages);

        var faqs = new List<FaqItem>
        {
            new() { Id = Guid.NewGuid(), Question = "How long do hair extensions last?", Answer = "With proper care, our virgin hair extensions can last 12-18 months or longer.", Category = "General", SortOrder = 1, IsPublished = true },
            new() { Id = Guid.NewGuid(), Question = "Can I color or bleach the hair?", Answer = "Yes! Our virgin hair has not been chemically processed, so it can be colored, bleached, and styled just like your natural hair.", Category = "General", SortOrder = 2, IsPublished = true },
            new() { Id = Guid.NewGuid(), Question = "What is the difference between bundles, closures, and frontals?", Answer = "Bundles are wefts of hair sewn together. Closures cover a small area (4x4 or 5x5) at the top. Frontals span ear to ear (13x4 or 13x6) for a complete natural hairline.", Category = "Products", SortOrder = 3, IsPublished = true },
            new() { Id = Guid.NewGuid(), Question = "How do I determine the right length?", Answer = "Measure from the crown of your head down to where you want the hair to fall. Our lengths are measured when the hair is straight.", Category = "Products", SortOrder = 4, IsPublished = true },
            new() { Id = Guid.NewGuid(), Question = "Do you offer wholesale pricing?", Answer = "Yes! We offer wholesale pricing for salons and stylists. Use our contact form to inquire about wholesale accounts and minimum order quantities.", Category = "Orders", SortOrder = 5, IsPublished = true },
            new() { Id = Guid.NewGuid(), Question = "What payment methods do you accept?", Answer = "We accept all major credit cards, debit cards, and bank transfers through our secure payment system.", Category = "Orders", SortOrder = 6, IsPublished = true }
        };

        context.Faqs.AddRange(faqs);

        var testimonials = new List<Testimonial>
        {
            new() { Id = Guid.NewGuid(), CustomerName = "Sarah M.", CustomerLocation = "Atlanta, GA", Content = "The quality of the Cambodian straight bundles is unmatched. I've been wearing them for 8 months and they still look brand new!", Rating = 5, IsApproved = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), CustomerName = "Jessica T.", CustomerLocation = "Houston, TX", Content = "I love knowing exactly where my hair comes from. The traceability Origin provides gives me peace of mind. Beautiful hair, ethical sourcing.", Rating = 5, IsApproved = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), CustomerName = "Aaliyah R.", CustomerLocation = "Brooklyn, NY", Content = "The Indian curly bundles hold their pattern perfectly even after washing. Best hair I've ever purchased, and the customer service is amazing.", Rating = 5, IsApproved = true, CreatedAt = DateTime.UtcNow }
        };

        context.Testimonials.AddRange(testimonials);
        await context.SaveChangesAsync();
    }
}
