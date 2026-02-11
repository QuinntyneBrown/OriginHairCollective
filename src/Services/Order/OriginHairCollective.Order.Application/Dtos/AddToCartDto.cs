namespace OriginHairCollective.Order.Application.Dtos;

public sealed record AddToCartDto(
    Guid ProductId,
    string ProductName,
    decimal UnitPrice,
    int Quantity);
