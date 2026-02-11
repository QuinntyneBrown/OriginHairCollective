using OriginHairCollective.Content.Core.Entities;
using OriginHairCollective.Content.Core.Interfaces;
using OriginHairCollective.Content.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Content.Infrastructure.Repositories;

public sealed class ContentPageRepository(ContentDbContext context) : IContentPageRepository
{
    public async Task<IReadOnlyList<ContentPage>> GetAllPublishedAsync(CancellationToken ct = default)
    {
        return await context.Pages
            .AsNoTracking()
            .Where(p => p.IsPublished)
            .OrderBy(p => p.SortOrder)
            .ToListAsync(ct);
    }

    public async Task<ContentPage?> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        return await context.Pages
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsPublished, ct);
    }

    public async Task<ContentPage> AddAsync(ContentPage page, CancellationToken ct = default)
    {
        context.Pages.Add(page);
        await context.SaveChangesAsync(ct);
        return page;
    }

    public async Task UpdateAsync(ContentPage page, CancellationToken ct = default)
    {
        context.Pages.Update(page);
        await context.SaveChangesAsync(ct);
    }
}
