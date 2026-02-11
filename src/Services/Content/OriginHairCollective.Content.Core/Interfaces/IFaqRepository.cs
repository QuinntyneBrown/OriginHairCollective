using OriginHairCollective.Content.Core.Entities;

namespace OriginHairCollective.Content.Core.Interfaces;

public interface IFaqRepository
{
    Task<IReadOnlyList<FaqItem>> GetAllPublishedAsync(CancellationToken ct = default);
    Task<IReadOnlyList<FaqItem>> GetByCategoryAsync(string category, CancellationToken ct = default);
    Task<FaqItem> AddAsync(FaqItem faq, CancellationToken ct = default);
}
