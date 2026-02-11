using OriginHairCollective.Order.Application.Dtos;
using OriginHairCollective.Order.Application.Mapping;
using OriginHairCollective.Order.Core.Entities;
using OriginHairCollective.Order.Core.Interfaces;

namespace OriginHairCollective.Order.Application.Services;

public sealed class CartService(ICartRepository cartRepository) : ICartService
{
    public async Task<IReadOnlyList<CartItemDto>> GetCartAsync(string sessionId, CancellationToken ct = default)
    {
        var items = await cartRepository.GetBySessionIdAsync(sessionId, ct);
        return items.Select(i => i.ToDto()).ToList();
    }

    public async Task<CartItemDto> AddToCartAsync(string sessionId, AddToCartDto dto, CancellationToken ct = default)
    {
        var item = new CartItem
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            ProductId = dto.ProductId,
            ProductName = dto.ProductName,
            UnitPrice = dto.UnitPrice,
            Quantity = dto.Quantity,
            AddedAt = DateTime.UtcNow
        };

        await cartRepository.AddAsync(item, ct);
        return item.ToDto();
    }

    public async Task RemoveFromCartAsync(Guid itemId, CancellationToken ct = default)
    {
        await cartRepository.RemoveAsync(itemId, ct);
    }

    public async Task ClearCartAsync(string sessionId, CancellationToken ct = default)
    {
        await cartRepository.ClearSessionAsync(sessionId, ct);
    }
}
