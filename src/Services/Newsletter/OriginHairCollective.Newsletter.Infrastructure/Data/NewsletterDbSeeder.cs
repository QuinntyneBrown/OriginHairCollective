using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Newsletter.Infrastructure.Data;

public static class NewsletterDbSeeder
{
    public static async Task SeedAsync(NewsletterDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Subscribers.AnyAsync())
            return;

        // No seed data required — subscribers and campaigns are created at runtime.
    }
}
