using OriginHairCollective.Catalog.Application.Dtos;

namespace OriginHairCollective.Catalog.Application.Services;

public interface ICatalogService
{
    Task<IReadOnlyList<HairProductDto>> GetAllProductsAsync(CancellationToken ct = default);
    Task<HairProductDto?> GetProductByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<HairProductDto>> GetProductsByOriginAsync(Guid originId, CancellationToken ct = default);
    Task<IReadOnlyList<HairOriginDto>> GetAllOriginsAsync(CancellationToken ct = default);
    Task<HairOriginDto?> GetOriginByIdAsync(Guid id, CancellationToken ct = default);
}
