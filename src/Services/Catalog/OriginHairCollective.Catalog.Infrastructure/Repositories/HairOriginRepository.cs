using OriginHairCollective.Catalog.Core.Entities;
using OriginHairCollective.Catalog.Core.Interfaces;
using OriginHairCollective.Catalog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Catalog.Infrastructure.Repositories;

public sealed class HairOriginRepository(CatalogDbContext context) : IHairOriginRepository
{
    public async Task<IReadOnlyList<HairOrigin>> GetAllAsync(CancellationToken ct = default)
    {
        return await context.Origins
            .AsNoTracking()
            .OrderBy(o => o.Country)
            .ToListAsync(ct);
    }

    public async Task<HairOrigin?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await context.Origins
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id, ct);
    }
}
