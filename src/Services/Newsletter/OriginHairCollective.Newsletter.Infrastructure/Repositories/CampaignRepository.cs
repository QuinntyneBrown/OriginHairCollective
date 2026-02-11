using OriginHairCollective.Newsletter.Core.Entities;
using OriginHairCollective.Newsletter.Core.Enums;
using OriginHairCollective.Newsletter.Core.Interfaces;
using OriginHairCollective.Newsletter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Newsletter.Infrastructure.Repositories;

public sealed class CampaignRepository(NewsletterDbContext context) : ICampaignRepository
{
    public async Task<Campaign?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await context.Campaigns.FindAsync([id], ct);
    }

    public async Task<(IReadOnlyList<Campaign> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, CampaignStatus? status, CancellationToken ct = default)
    {
        var query = context.Campaigns.AsQueryable();

        if (status.HasValue)
            query = query.Where(c => c.Status == status.Value);

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task<IReadOnlyList<Campaign>> GetScheduledDueAsync(DateTime asOf, CancellationToken ct = default)
    {
        return await context.Campaigns
            .Where(c => c.Status == CampaignStatus.Scheduled && c.ScheduledAt <= asOf)
            .ToListAsync(ct);
    }

    public async Task AddAsync(Campaign campaign, CancellationToken ct = default)
    {
        context.Campaigns.Add(campaign);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Campaign campaign, CancellationToken ct = default)
    {
        context.Campaigns.Update(campaign);
        await context.SaveChangesAsync(ct);
    }
}
