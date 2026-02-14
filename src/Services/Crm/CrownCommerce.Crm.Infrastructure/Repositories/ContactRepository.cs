using CrownCommerce.Crm.Core.Entities;
using CrownCommerce.Crm.Core.Interfaces;
using CrownCommerce.Crm.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CrownCommerce.Crm.Infrastructure.Repositories;

public sealed class ContactRepository : IContactRepository
{
    private readonly CrmDbContext _context;

    public ContactRepository(CrmDbContext context)
    {
        _context = context;
    }

    public async Task<List<Contact>> GetAllAsync(CancellationToken ct)
    {
        return await _context.Contacts
            .Include(c => c.Interactions)
            .Include(c => c.FollowUps)
            .Include(c => c.Tags)
            .ToListAsync(ct);
    }

    public async Task<Contact?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.Contacts
            .Include(c => c.Interactions)
            .Include(c => c.FollowUps)
            .Include(c => c.Tags)
            .FirstOrDefaultAsync(c => c.Id == id, ct);
    }

    public async Task<Contact> AddAsync(Contact contact, CancellationToken ct)
    {
        contact.CreatedAt = DateTime.UtcNow;
        _context.Contacts.Add(contact);
        await _context.SaveChangesAsync(ct);
        return contact;
    }

    public async Task UpdateAsync(Contact contact, CancellationToken ct)
    {
        contact.UpdatedAt = DateTime.UtcNow;
        _context.Contacts.Update(contact);
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var contact = await _context.Contacts.FindAsync([id], ct);
        if (contact != null)
        {
            _context.Contacts.Remove(contact);
            await _context.SaveChangesAsync(ct);
        }
    }
}
