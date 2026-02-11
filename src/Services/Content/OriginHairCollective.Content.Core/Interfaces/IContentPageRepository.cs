using OriginHairCollective.Content.Core.Entities;

namespace OriginHairCollective.Content.Core.Interfaces;

public interface IContentPageRepository
{
    Task<IReadOnlyList<ContentPage>> GetAllPublishedAsync(CancellationToken ct = default);
    Task<ContentPage?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<ContentPage> AddAsync(ContentPage page, CancellationToken ct = default);
    Task UpdateAsync(ContentPage page, CancellationToken ct = default);
}
