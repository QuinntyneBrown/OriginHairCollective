using OriginHairCollective.Order.Core.Entities;
using OriginHairCollective.Order.Core.Interfaces;
using OriginHairCollective.Order.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Order.Infrastructure.Repositories;

public sealed class OrderRepository(OrderDbContext context) : IOrderRepository
{
    public async Task<IReadOnlyList<CustomerOrder>> GetAllAsync(CancellationToken ct = default)
    {
        return await context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<CustomerOrder?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, ct);
    }

    public async Task<IReadOnlyList<CustomerOrder>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        return await context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<CustomerOrder> AddAsync(CustomerOrder order, CancellationToken ct = default)
    {
        context.Orders.Add(order);
        await context.SaveChangesAsync(ct);
        return order;
    }

    public async Task UpdateAsync(CustomerOrder order, CancellationToken ct = default)
    {
        context.Orders.Update(order);
        await context.SaveChangesAsync(ct);
    }
}
