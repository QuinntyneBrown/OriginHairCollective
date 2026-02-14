using CrownCommerce.Crm.Core.Entities;

namespace CrownCommerce.Crm.Core.Interfaces;

public interface IContactRepository
{
    Task<List<Contact>> GetAllAsync(CancellationToken ct);
    Task<Contact?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<Contact> AddAsync(Contact contact, CancellationToken ct);
    Task UpdateAsync(Contact contact, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}
