using OriginHairCollective.Order.Application.Dtos;
using OriginHairCollective.Order.Core.Entities;

namespace OriginHairCollective.Order.Application.Mapping;

public static class OrderMappingExtensions
{
    public static OrderDto ToDto(this CustomerOrder order) =>
        new(
            order.Id,
            order.UserId,
            order.CustomerEmail,
            order.CustomerName,
            order.ShippingAddress,
            order.TrackingNumber,
            order.Status.ToString(),
            order.TotalAmount,
            order.CreatedAt,
            order.Items.Select(i => i.ToDto()).ToList());

    public static OrderItemDto ToDto(this OrderItem item) =>
        new(
            item.Id,
            item.ProductId,
            item.ProductName,
            item.Quantity,
            item.UnitPrice,
            item.LineTotal);

    public static CartItemDto ToDto(this CartItem item) =>
        new(
            item.Id,
            item.ProductId,
            item.ProductName,
            item.UnitPrice,
            item.Quantity,
            item.Quantity * item.UnitPrice);
}
