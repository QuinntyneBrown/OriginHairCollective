using OriginHairCollective.Order.Application.Dtos;

namespace OriginHairCollective.Order.Application.Services;

public interface ICartService
{
    Task<IReadOnlyList<CartItemDto>> GetCartAsync(string sessionId, CancellationToken ct = default);
    Task<CartItemDto> AddToCartAsync(string sessionId, AddToCartDto dto, CancellationToken ct = default);
    Task RemoveFromCartAsync(Guid itemId, CancellationToken ct = default);
    Task ClearCartAsync(string sessionId, CancellationToken ct = default);
}
