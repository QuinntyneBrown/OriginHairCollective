using CrownCommerce.Crm.Core.Entities;
using CrownCommerce.Crm.Core.Enums;
using CrownCommerce.Crm.Core.Interfaces;
using CrownCommerce.Crm.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CrownCommerce.Crm.Infrastructure.Repositories;

public sealed class FollowUpRepository : IFollowUpRepository
{
    private readonly CrmDbContext _context;

    public FollowUpRepository(CrmDbContext context)
    {
        _context = context;
    }

    public async Task<List<FollowUp>> GetAllAsync(CancellationToken ct)
    {
        return await _context.FollowUps
            .Include(f => f.Contact)
            .OrderBy(f => f.DueDate)
            .ToListAsync(ct);
    }

    public async Task<FollowUp?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.FollowUps
            .Include(f => f.Contact)
            .FirstOrDefaultAsync(f => f.Id == id, ct);
    }

    public async Task<List<FollowUp>> GetByContactIdAsync(Guid contactId, CancellationToken ct)
    {
        return await _context.FollowUps
            .Where(f => f.ContactId == contactId)
            .OrderBy(f => f.DueDate)
            .ToListAsync(ct);
    }

    public async Task<List<FollowUp>> GetDueFollowUpsAsync(DateTime date, CancellationToken ct)
    {
        return await _context.FollowUps
            .Include(f => f.Contact)
            .Where(f => f.DueDate.Date == date.Date && f.Status == FollowUpStatus.Pending)
            .ToListAsync(ct);
    }

    public async Task<FollowUp> AddAsync(FollowUp followUp, CancellationToken ct)
    {
        followUp.CreatedAt = DateTime.UtcNow;
        followUp.Status = FollowUpStatus.Pending;
        _context.FollowUps.Add(followUp);
        await _context.SaveChangesAsync(ct);
        return followUp;
    }

    public async Task UpdateAsync(FollowUp followUp, CancellationToken ct)
    {
        followUp.UpdatedAt = DateTime.UtcNow;
        _context.FollowUps.Update(followUp);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var followUp = await _context.FollowUps.FindAsync([id], ct);
        if (followUp != null)
        {
            _context.FollowUps.Remove(followUp);
            await _context.SaveChangesAsync(ct);
        }
    }
}
