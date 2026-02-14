using CrownCommerce.Crm.Core.Entities;

namespace CrownCommerce.Crm.Core.Interfaces;

public interface IFollowUpRepository
{
    Task<List<FollowUp>> GetAllAsync(CancellationToken ct);
    Task<FollowUp?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<List<FollowUp>> GetByContactIdAsync(Guid contactId, CancellationToken ct);
    Task<List<FollowUp>> GetDueFollowUpsAsync(DateTime date, CancellationToken ct);
    Task<FollowUp> AddAsync(FollowUp followUp, CancellationToken ct);
    Task UpdateAsync(FollowUp followUp, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}
