using CrownCommerce.Crm.Core.Entities;
using CrownCommerce.Crm.Core.Interfaces;
using CrownCommerce.Crm.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CrownCommerce.Crm.Infrastructure.Repositories;

public sealed class InteractionRepository : IInteractionRepository
{
    private readonly CrmDbContext _context;

    public InteractionRepository(CrmDbContext context)
    {
        _context = context;
    }

    public async Task<List<Interaction>> GetAllAsync(CancellationToken ct)
    {
        return await _context.Interactions
            .Include(i => i.Contact)
            .OrderByDescending(i => i.InteractionDate)
            .ToListAsync(ct);
    }

    public async Task<Interaction?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.Interactions
            .Include(i => i.Contact)
            .FirstOrDefaultAsync(i => i.Id == id, ct);
    }

    public async Task<List<Interaction>> GetByContactIdAsync(Guid contactId, CancellationToken ct)
    {
        return await _context.Interactions
            .Where(i => i.ContactId == contactId)
            .OrderByDescending(i => i.InteractionDate)
            .ToListAsync(ct);
    }

    public async Task<Interaction> AddAsync(Interaction interaction, CancellationToken ct)
    {
        interaction.CreatedAt = DateTime.UtcNow;
        _context.Interactions.Add(interaction);
        await _context.SaveChangesAsync(ct);
        return interaction;
    }

    public async Task UpdateAsync(Interaction interaction, CancellationToken ct)
    {
        _context.Interactions.Update(interaction);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var interaction = await _context.Interactions.FindAsync([id], ct);
        if (interaction != null)
        {
            _context.Interactions.Remove(interaction);
            await _context.SaveChangesAsync(ct);
        }
    }
}
