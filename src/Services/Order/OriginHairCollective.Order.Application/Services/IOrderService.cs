using OriginHairCollective.Order.Application.Dtos;

namespace OriginHairCollective.Order.Application.Services;

public interface IOrderService
{
    Task<OrderDto> CreateOrderFromCartAsync(string sessionId, CreateOrderDto dto, CancellationToken ct = default);
    Task<OrderDto?> GetOrderByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<OrderDto>> GetOrdersByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<OrderDto?> UpdateOrderStatusAsync(Guid id, string status, string? trackingNumber, CancellationToken ct = default);
}
