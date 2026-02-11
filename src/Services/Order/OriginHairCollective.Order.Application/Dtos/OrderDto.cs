namespace OriginHairCollective.Order.Application.Dtos;

public sealed record OrderDto(
    Guid Id,
    Guid? UserId,
    string CustomerEmail,
    string CustomerName,
    string ShippingAddress,
    string? TrackingNumber,
    string Status,
    decimal TotalAmount,
    DateTime CreatedAt,
    List<OrderItemDto> Items);
