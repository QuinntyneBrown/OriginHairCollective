namespace OriginHairCollective.Order.Application.Dtos;

public sealed record CreateOrderDto(
    string CustomerEmail,
    string CustomerName,
    string ShippingAddress,
    Guid? UserId);
