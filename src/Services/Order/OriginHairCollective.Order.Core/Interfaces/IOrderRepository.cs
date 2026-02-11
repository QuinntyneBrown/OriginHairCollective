using OriginHairCollective.Order.Core.Entities;

namespace OriginHairCollective.Order.Core.Interfaces;

public interface IOrderRepository
{
    Task<IReadOnlyList<CustomerOrder>> GetAllAsync(CancellationToken ct = default);
    Task<CustomerOrder?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<CustomerOrder>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<CustomerOrder> AddAsync(CustomerOrder order, CancellationToken ct = default);
    Task UpdateAsync(CustomerOrder order, CancellationToken ct = default);
}
