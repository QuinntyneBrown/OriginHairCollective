namespace OriginHairCollective.Shared.Contracts;

public sealed record OrderCreatedEvent(
    Guid OrderId,
    Guid? UserId,
    string CustomerEmail,
    string CustomerName,
    decimal TotalAmount,
    int ItemCount,
    DateTime OccurredAt);
