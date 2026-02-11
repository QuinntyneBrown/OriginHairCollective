using OriginHairCollective.Content.Core.Entities;
using OriginHairCollective.Content.Core.Interfaces;
using OriginHairCollective.Content.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Content.Infrastructure.Repositories;

public sealed class GalleryRepository(ContentDbContext context) : IGalleryRepository
{
    public async Task<IReadOnlyList<GalleryImage>> GetAllPublishedAsync(CancellationToken ct = default)
    {
        return await context.GalleryImages
            .AsNoTracking()
            .Where(g => g.IsPublished)
            .OrderBy(g => g.SortOrder)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<GalleryImage>> GetByCategoryAsync(string category, CancellationToken ct = default)
    {
        return await context.GalleryImages
            .AsNoTracking()
            .Where(g => g.IsPublished && g.Category == category)
            .OrderBy(g => g.SortOrder)
            .ToListAsync(ct);
    }

    public async Task<GalleryImage> AddAsync(GalleryImage image, CancellationToken ct = default)
    {
        context.GalleryImages.Add(image);
        await context.SaveChangesAsync(ct);
        return image;
    }
}
