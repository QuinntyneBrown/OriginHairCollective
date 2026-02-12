using System.Security.Cryptography;
using OriginHairCollective.Identity.Core.Entities;
using OriginHairCollective.Identity.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Identity.Infrastructure.Data;

public static class IdentityDbSeeder
{
    public static async Task SeedAsync(IdentityDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Users.AnyAsync())
            return;

        var admin = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = "admin@originhair.com",
            PasswordHash = HashPassword("Admin123!"),
            FirstName = "Quinn",
            LastName = "Morgan",
            Phone = "(416) 555-0100",
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(admin);
        await context.SaveChangesAsync();
    }

    private static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        var combined = new byte[48];
        salt.CopyTo(combined, 0);
        hash.CopyTo(combined, 16);
        return Convert.ToBase64String(combined);
    }
}
