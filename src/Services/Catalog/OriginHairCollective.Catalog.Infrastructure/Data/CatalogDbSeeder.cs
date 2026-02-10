using OriginHairCollective.Catalog.Core.Entities;
using OriginHairCollective.Catalog.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Catalog.Infrastructure.Data;

public static class CatalogDbSeeder
{
    public static async Task SeedAsync(CatalogDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Origins.AnyAsync())
            return;

        var cambodia = new HairOrigin
        {
            Id = Guid.NewGuid(),
            Country = "Cambodia",
            Region = "Southeast Asia",
            Description = "Cambodian hair is renowned for its natural thickness and durability. Sourced from rural communities, it maintains its integrity through minimal chemical processing."
        };

        var indonesia = new HairOrigin
        {
            Id = Guid.NewGuid(),
            Country = "Indonesia",
            Region = "Southeast Asia",
            Description = "Indonesian hair offers a naturally silky texture with a slight wave. Ethically sourced from temple donations and direct partnerships."
        };

        var india = new HairOrigin
        {
            Id = Guid.NewGuid(),
            Country = "India",
            Region = "South Asia",
            Description = "Indian hair is versatile and available in a wide range of textures. Sourced from temples and cooperatives across the subcontinent."
        };

        var vietnam = new HairOrigin
        {
            Id = Guid.NewGuid(),
            Country = "Vietnam",
            Region = "Southeast Asia",
            Description = "Vietnamese hair is prized for its strength and natural straight texture. Our partnerships ensure fair-trade sourcing from local communities."
        };

        var myanmar = new HairOrigin
        {
            Id = Guid.NewGuid(),
            Country = "Myanmar",
            Region = "Southeast Asia",
            Description = "Myanmar hair is exceptionally soft and lightweight. We work with ethical suppliers to bring you the finest quality raw hair."
        };

        context.Origins.AddRange(cambodia, indonesia, india, vietnam, myanmar);

        var products = new List<HairProduct>
        {
            new()
            {
                Id = Guid.NewGuid(), Name = "Cambodian Straight Bundle", OriginId = cambodia.Id,
                Texture = HairTexture.Straight, Type = HairType.Bundle, LengthInches = 18, Price = 185.00m,
                Description = "Premium raw Cambodian straight hair bundle. Natural color, single donor, cuticle aligned.",
                ImageUrl = "/images/cambodian-straight-bundle.jpg"
            },
            new()
            {
                Id = Guid.NewGuid(), Name = "Cambodian Wavy Bundle", OriginId = cambodia.Id,
                Texture = HairTexture.Wavy, Type = HairType.Bundle, LengthInches = 20, Price = 210.00m,
                Description = "Luxurious Cambodian wavy bundle with a natural body wave pattern. Minimal shedding guaranteed.",
                ImageUrl = "/images/cambodian-wavy-bundle.jpg"
            },
            new()
            {
                Id = Guid.NewGuid(), Name = "Indonesian Silky Straight Bundle", OriginId = indonesia.Id,
                Texture = HairTexture.Straight, Type = HairType.Bundle, LengthInches = 22, Price = 195.00m,
                Description = "Silky smooth Indonesian straight hair. Lightweight and easy to maintain.",
                ImageUrl = "/images/indonesian-silky-straight.jpg"
            },
            new()
            {
                Id = Guid.NewGuid(), Name = "Indonesian Curly Closure", OriginId = indonesia.Id,
                Texture = HairTexture.Curly, Type = HairType.Closure, LengthInches = 16, Price = 150.00m,
                Description = "4x4 lace closure with natural Indonesian curly pattern. Pre-plucked hairline.",
                ImageUrl = "/images/indonesian-curly-closure.jpg"
            },
            new()
            {
                Id = Guid.NewGuid(), Name = "Indian Curly Bundle", OriginId = india.Id,
                Texture = HairTexture.Curly, Type = HairType.Bundle, LengthInches = 24, Price = 175.00m,
                Description = "Deep curly Indian hair bundle. Rich, bouncy curls that hold their pattern after washing.",
                ImageUrl = "/images/indian-curly-bundle.jpg"
            },
            new()
            {
                Id = Guid.NewGuid(), Name = "Indian Wavy Frontal", OriginId = india.Id,
                Texture = HairTexture.Wavy, Type = HairType.Frontal, LengthInches = 18, Price = 220.00m,
                Description = "13x4 lace frontal with natural Indian body wave. HD lace for seamless blending.",
                ImageUrl = "/images/indian-wavy-frontal.jpg"
            },
            new()
            {
                Id = Guid.NewGuid(), Name = "Indian Kinky Straight Bundle", OriginId = india.Id,
                Texture = HairTexture.Kinky, Type = HairType.Bundle, LengthInches = 16, Price = 165.00m,
                Description = "Natural kinky straight texture that mimics relaxed African hair. Blends beautifully.",
                ImageUrl = "/images/indian-kinky-straight.jpg"
            },
            new()
            {
                Id = Guid.NewGuid(), Name = "Vietnamese Straight Bundle", OriginId = vietnam.Id,
                Texture = HairTexture.Straight, Type = HairType.Bundle, LengthInches = 26, Price = 230.00m,
                Description = "Ultra-long Vietnamese straight hair. Bone straight with a natural sheen.",
                ImageUrl = "/images/vietnamese-straight-bundle.jpg"
            },
            new()
            {
                Id = Guid.NewGuid(), Name = "Vietnamese Wavy Wig", OriginId = vietnam.Id,
                Texture = HairTexture.Wavy, Type = HairType.Wig, LengthInches = 20, Price = 450.00m,
                Description = "Full lace wig with Vietnamese wavy hair. Pre-styled and ready to wear.",
                ImageUrl = "/images/vietnamese-wavy-wig.jpg"
            },
            new()
            {
                Id = Guid.NewGuid(), Name = "Vietnamese Curly Bundle", OriginId = vietnam.Id,
                Texture = HairTexture.Curly, Type = HairType.Bundle, LengthInches = 18, Price = 200.00m,
                Description = "Natural curly Vietnamese hair bundle. Soft, defined curls with zero processing.",
                ImageUrl = "/images/vietnamese-curly-bundle.jpg"
            },
            new()
            {
                Id = Guid.NewGuid(), Name = "Myanmar Straight Closure", OriginId = myanmar.Id,
                Texture = HairTexture.Straight, Type = HairType.Closure, LengthInches = 14, Price = 130.00m,
                Description = "5x5 HD lace closure with Myanmar straight hair. Feather-light and undetectable.",
                ImageUrl = "/images/myanmar-straight-closure.jpg"
            },
            new()
            {
                Id = Guid.NewGuid(), Name = "Myanmar Wavy Bundle", OriginId = myanmar.Id,
                Texture = HairTexture.Wavy, Type = HairType.Bundle, LengthInches = 20, Price = 190.00m,
                Description = "Raw Myanmar wavy hair bundle. Gorgeous natural wave with exceptional softness.",
                ImageUrl = "/images/myanmar-wavy-bundle.jpg"
            }
        };

        context.Products.AddRange(products);
        await context.SaveChangesAsync();
    }
}
