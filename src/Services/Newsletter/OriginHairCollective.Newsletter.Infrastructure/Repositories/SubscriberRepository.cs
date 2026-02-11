using OriginHairCollective.Newsletter.Core.Entities;
using OriginHairCollective.Newsletter.Core.Enums;
using OriginHairCollective.Newsletter.Core.Interfaces;
using OriginHairCollective.Newsletter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Newsletter.Infrastructure.Repositories;

public sealed class SubscriberRepository(NewsletterDbContext context) : ISubscriberRepository
{
    public async Task<Subscriber?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await context.Subscribers
            .Include(s => s.Tags)
            .FirstOrDefaultAsync(s => s.Id == id, ct);
    }

    public async Task<Subscriber?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        return await context.Subscribers
            .Include(s => s.Tags)
            .FirstOrDefaultAsync(s => s.Email == email, ct);
    }

    public async Task<Subscriber?> GetByConfirmationTokenAsync(string token, CancellationToken ct = default)
    {
        return await context.Subscribers
            .Include(s => s.Tags)
            .FirstOrDefaultAsync(s => s.ConfirmationToken == token, ct);
    }

    public async Task<Subscriber?> GetByUnsubscribeTokenAsync(string token, CancellationToken ct = default)
    {
        return await context.Subscribers
            .Include(s => s.Tags)
            .FirstOrDefaultAsync(s => s.UnsubscribeToken == token, ct);
    }

    public async Task<(IReadOnlyList<Subscriber> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, SubscriberStatus? status, string? tag, CancellationToken ct = default)
    {
        var query = context.Subscribers.Include(s => s.Tags).AsQueryable();

        if (status.HasValue)
            query = query.Where(s => s.Status == status.Value);

        if (!string.IsNullOrEmpty(tag))
            query = query.Where(s => s.Tags.Any(t => t.Tag == tag));

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task<IReadOnlyList<Subscriber>> GetActiveByTagAsync(string? tag, CancellationToken ct = default)
    {
        var query = context.Subscribers
            .Where(s => s.Status == SubscriberStatus.Active);

        if (!string.IsNullOrEmpty(tag))
            query = query.Where(s => s.Tags.Any(t => t.Tag == tag));

        return await query.ToListAsync(ct);
    }

    public async Task<(int TotalActive, int TotalPending, int TotalUnsubscribed, int RecentSubscribers)> GetStatsAsync(
        CancellationToken ct = default)
    {
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

        var totalActive = await context.Subscribers.CountAsync(s => s.Status == SubscriberStatus.Active, ct);
        var totalPending = await context.Subscribers.CountAsync(s => s.Status == SubscriberStatus.Pending, ct);
        var totalUnsubscribed = await context.Subscribers.CountAsync(s => s.Status == SubscriberStatus.Unsubscribed, ct);
        var recentSubscribers = await context.Subscribers.CountAsync(
            s => s.Status == SubscriberStatus.Active && s.ConfirmedAt >= thirtyDaysAgo, ct);

        return (totalActive, totalPending, totalUnsubscribed, recentSubscribers);
    }

    public async Task AddAsync(Subscriber subscriber, CancellationToken ct = default)
    {
        context.Subscribers.Add(subscriber);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Subscriber subscriber, CancellationToken ct = default)
    {
        context.Subscribers.Update(subscriber);
        await context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var subscriber = await context.Subscribers.FindAsync([id], ct);
        if (subscriber is not null)
        {
            context.Subscribers.Remove(subscriber);
            await context.SaveChangesAsync(ct);
        }
    }
}
