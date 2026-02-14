using CrownCommerce.Vendor.Core.Entities;
using CrownCommerce.Vendor.Core.Enums;
using CrownCommerce.Vendor.Core.Interfaces;
using CrownCommerce.Vendor.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CrownCommerce.Vendor.Infrastructure.Repositories;

public sealed class VendorRepository(VendorDbContext context) : IVendorRepository
{
    public async Task<IReadOnlyList<Core.Entities.Vendor>> GetAllAsync(CancellationToken ct = default)
    {
        return await context.Vendors
            .AsNoTracking()
            .Include(v => v.Scores)
            .Include(v => v.RedFlags)
            .OrderBy(v => v.CompanyName)
            .ToListAsync(ct);
    }

    public async Task<Core.Entities.Vendor?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await context.Vendors
            .Include(v => v.Scores)
            .Include(v => v.RedFlags)
            .Include(v => v.FollowUps.OrderByDescending(f => f.CreatedAt))
            .FirstOrDefaultAsync(v => v.Id == id, ct);
    }

    public async Task<IReadOnlyList<Core.Entities.Vendor>> GetByStatusAsync(VendorStatus status, CancellationToken ct = default)
    {
        return await context.Vendors
            .AsNoTracking()
            .Include(v => v.Scores)
            .Include(v => v.RedFlags)
            .Where(v => v.Status == status)
            .OrderBy(v => v.CompanyName)
            .ToListAsync(ct);
    }

    public async Task<Core.Entities.Vendor> AddAsync(Core.Entities.Vendor vendor, CancellationToken ct = default)
    {
        context.Vendors.Add(vendor);
        await context.SaveChangesAsync(ct);
        return vendor;
    }

    public async Task UpdateAsync(Core.Entities.Vendor vendor, CancellationToken ct = default)
    {
        context.Vendors.Update(vendor);
        await context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var vendor = await context.Vendors.FindAsync([id], ct);
        if (vendor is not null)
        {
            context.Vendors.Remove(vendor);
            await context.SaveChangesAsync(ct);
        }
    }

    public async Task AddScoresAsync(IEnumerable<VendorScore> scores, CancellationToken ct = default)
    {
        context.VendorScores.AddRange(scores);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateScoresAsync(IEnumerable<VendorScore> scores, CancellationToken ct = default)
    {
        foreach (var score in scores)
        {
            context.VendorScores.Update(score);
        }
        await context.SaveChangesAsync(ct);
    }

    public async Task AddRedFlagsAsync(IEnumerable<VendorRedFlag> redFlags, CancellationToken ct = default)
    {
        context.VendorRedFlags.AddRange(redFlags);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateRedFlagsAsync(IEnumerable<VendorRedFlag> redFlags, CancellationToken ct = default)
    {
        foreach (var flag in redFlags)
        {
            context.VendorRedFlags.Update(flag);
        }
        await context.SaveChangesAsync(ct);
    }

    public async Task<VendorFollowUp> AddFollowUpAsync(VendorFollowUp followUp, CancellationToken ct = default)
    {
        context.VendorFollowUps.Add(followUp);
        await context.SaveChangesAsync(ct);
        return followUp;
    }

    public async Task<IReadOnlyList<VendorFollowUp>> GetFollowUpsByVendorIdAsync(Guid vendorId, CancellationToken ct = default)
    {
        return await context.VendorFollowUps
            .AsNoTracking()
            .Where(f => f.VendorId == vendorId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync(ct);
    }
}
