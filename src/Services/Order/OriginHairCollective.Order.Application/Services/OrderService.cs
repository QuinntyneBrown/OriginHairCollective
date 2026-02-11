using OriginHairCollective.Order.Application.Dtos;
using OriginHairCollective.Order.Application.Mapping;
using OriginHairCollective.Order.Core.Entities;
using OriginHairCollective.Order.Core.Enums;
using OriginHairCollective.Order.Core.Interfaces;
using OriginHairCollective.Shared.Contracts;
using MassTransit;

namespace OriginHairCollective.Order.Application.Services;

public sealed class OrderService(
    IOrderRepository orderRepository,
    ICartRepository cartRepository,
    IPublishEndpoint publishEndpoint) : IOrderService
{
    public async Task<OrderDto> CreateOrderFromCartAsync(string sessionId, CreateOrderDto dto, CancellationToken ct = default)
    {
        var cartItems = await cartRepository.GetBySessionIdAsync(sessionId, ct);
        if (cartItems.Count == 0)
            throw new InvalidOperationException("Cart is empty.");

        var order = new CustomerOrder
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            CustomerEmail = dto.CustomerEmail,
            CustomerName = dto.CustomerName,
            ShippingAddress = dto.ShippingAddress,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            Items = cartItems.Select(c => new OrderItem
            {
                Id = Guid.NewGuid(),
                ProductId = c.ProductId,
                ProductName = c.ProductName,
                Quantity = c.Quantity,
                UnitPrice = c.UnitPrice
            }).ToList()
        };

        order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);

        await orderRepository.AddAsync(order, ct);
        await cartRepository.ClearSessionAsync(sessionId, ct);

        await publishEndpoint.Publish(new OrderCreatedEvent(
            order.Id,
            order.UserId,
            order.CustomerEmail,
            order.CustomerName,
            order.TotalAmount,
            order.Items.Count,
            DateTime.UtcNow), ct);

        return order.ToDto();
    }

    public async Task<OrderDto?> GetOrderByIdAsync(Guid id, CancellationToken ct = default)
    {
        var order = await orderRepository.GetByIdAsync(id, ct);
        return order?.ToDto();
    }

    public async Task<IReadOnlyList<OrderDto>> GetOrdersByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        var orders = await orderRepository.GetByUserIdAsync(userId, ct);
        return orders.Select(o => o.ToDto()).ToList();
    }

    public async Task<OrderDto?> UpdateOrderStatusAsync(Guid id, string status, string? trackingNumber, CancellationToken ct = default)
    {
        var order = await orderRepository.GetByIdAsync(id, ct);
        if (order is null) return null;

        if (!Enum.TryParse<OrderStatus>(status, true, out var newStatus))
            throw new ArgumentException($"Invalid order status: {status}");

        order.Status = newStatus;
        order.TrackingNumber = trackingNumber ?? order.TrackingNumber;
        order.UpdatedAt = DateTime.UtcNow;

        await orderRepository.UpdateAsync(order, ct);

        await publishEndpoint.Publish(new OrderStatusChangedEvent(
            order.Id,
            order.UserId,
            order.CustomerEmail,
            newStatus.ToString(),
            order.TrackingNumber,
            DateTime.UtcNow), ct);

        return order.ToDto();
    }
}
