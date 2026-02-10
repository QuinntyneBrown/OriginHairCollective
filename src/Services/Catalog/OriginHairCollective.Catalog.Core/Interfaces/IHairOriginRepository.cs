using OriginHairCollective.Catalog.Core.Entities;

namespace OriginHairCollective.Catalog.Core.Interfaces;

public interface IHairOriginRepository
{
    Task<IReadOnlyList<HairOrigin>> GetAllAsync(CancellationToken ct = default);
    Task<HairOrigin?> GetByIdAsync(Guid id, CancellationToken ct = default);
}
