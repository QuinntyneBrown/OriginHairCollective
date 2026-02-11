using OriginHairCollective.Order.Core.Entities;
using OriginHairCollective.Order.Core.Interfaces;
using OriginHairCollective.Order.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Order.Infrastructure.Repositories;

public sealed class CartRepository(OrderDbContext context) : ICartRepository
{
    public async Task<IReadOnlyList<CartItem>> GetBySessionIdAsync(string sessionId, CancellationToken ct = default)
    {
        return await context.CartItems
            .AsNoTracking()
            .Where(c => c.SessionId == sessionId)
            .OrderBy(c => c.AddedAt)
            .ToListAsync(ct);
    }

    public async Task<CartItem> AddAsync(CartItem item, CancellationToken ct = default)
    {
        context.CartItems.Add(item);
        await context.SaveChangesAsync(ct);
        return item;
    }

    public async Task UpdateAsync(CartItem item, CancellationToken ct = default)
    {
        context.CartItems.Update(item);
        await context.SaveChangesAsync(ct);
    }

    public async Task RemoveAsync(Guid id, CancellationToken ct = default)
    {
        var item = await context.CartItems.FindAsync([id], ct);
        if (item is not null)
        {
            context.CartItems.Remove(item);
            await context.SaveChangesAsync(ct);
        }
    }

    public async Task ClearSessionAsync(string sessionId, CancellationToken ct = default)
    {
        var items = await context.CartItems
            .Where(c => c.SessionId == sessionId)
            .ToListAsync(ct);
        context.CartItems.RemoveRange(items);
        await context.SaveChangesAsync(ct);
    }
}
