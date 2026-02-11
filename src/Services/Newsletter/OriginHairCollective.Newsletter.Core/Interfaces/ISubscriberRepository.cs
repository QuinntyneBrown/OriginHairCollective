using OriginHairCollective.Newsletter.Core.Enums;

namespace OriginHairCollective.Newsletter.Core.Interfaces;

public interface ISubscriberRepository
{
    Task<Entities.Subscriber?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Entities.Subscriber?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<Entities.Subscriber?> GetByConfirmationTokenAsync(string token, CancellationToken ct = default);
    Task<Entities.Subscriber?> GetByUnsubscribeTokenAsync(string token, CancellationToken ct = default);
    Task<(IReadOnlyList<Entities.Subscriber> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, SubscriberStatus? status, string? tag, CancellationToken ct = default);
    Task<IReadOnlyList<Entities.Subscriber>> GetActiveByTagAsync(string? tag, CancellationToken ct = default);
    Task<(int TotalActive, int TotalPending, int TotalUnsubscribed, int RecentSubscribers)> GetStatsAsync(CancellationToken ct = default);
    Task AddAsync(Entities.Subscriber subscriber, CancellationToken ct = default);
    Task UpdateAsync(Entities.Subscriber subscriber, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
