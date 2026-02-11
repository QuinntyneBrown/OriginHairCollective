using OriginHairCollective.Content.Core.Entities;

namespace OriginHairCollective.Content.Core.Interfaces;

public interface IGalleryRepository
{
    Task<IReadOnlyList<GalleryImage>> GetAllPublishedAsync(CancellationToken ct = default);
    Task<IReadOnlyList<GalleryImage>> GetByCategoryAsync(string category, CancellationToken ct = default);
    Task<GalleryImage> AddAsync(GalleryImage image, CancellationToken ct = default);
}
