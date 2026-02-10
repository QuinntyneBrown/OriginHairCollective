using OriginHairCollective.Catalog.Application.Dtos;
using OriginHairCollective.Catalog.Application.Mapping;
using OriginHairCollective.Catalog.Core.Interfaces;

namespace OriginHairCollective.Catalog.Application.Services;

public sealed class CatalogService(ICatalogRepository catalogRepo, IHairOriginRepository originRepo) : ICatalogService
{
    public async Task<IReadOnlyList<HairProductDto>> GetAllProductsAsync(CancellationToken ct = default)
    {
        var products = await catalogRepo.GetAllAsync(ct);
        return products.Select(p => p.ToDto()).ToList();
    }

    public async Task<HairProductDto?> GetProductByIdAsync(Guid id, CancellationToken ct = default)
    {
        var product = await catalogRepo.GetByIdAsync(id, ct);
        return product?.ToDto();
    }

    public async Task<IReadOnlyList<HairProductDto>> GetProductsByOriginAsync(Guid originId, CancellationToken ct = default)
    {
        var products = await catalogRepo.GetByOriginIdAsync(originId, ct);
        return products.Select(p => p.ToDto()).ToList();
    }

    public async Task<IReadOnlyList<HairOriginDto>> GetAllOriginsAsync(CancellationToken ct = default)
    {
        var origins = await originRepo.GetAllAsync(ct);
        return origins.Select(o => o.ToDto()).ToList();
    }

    public async Task<HairOriginDto?> GetOriginByIdAsync(Guid id, CancellationToken ct = default)
    {
        var origin = await originRepo.GetByIdAsync(id, ct);
        return origin?.ToDto();
    }
}
