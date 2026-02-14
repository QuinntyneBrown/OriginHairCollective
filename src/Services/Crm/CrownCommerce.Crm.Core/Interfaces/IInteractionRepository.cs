using CrownCommerce.Crm.Core.Entities;

namespace CrownCommerce.Crm.Core.Interfaces;

public interface IInteractionRepository
{
    Task<List<Interaction>> GetAllAsync(CancellationToken ct);
    Task<Interaction?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<List<Interaction>> GetByContactIdAsync(Guid contactId, CancellationToken ct);
    Task<Interaction> AddAsync(Interaction interaction, CancellationToken ct);
    Task UpdateAsync(Interaction interaction, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}
