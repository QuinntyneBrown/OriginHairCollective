namespace OriginHairCollective.Shared.Contracts;

public sealed record ProductInterestEvent(
    Guid ProductId,
    string ProductName,
    string CustomerName,
    string CustomerEmail,
    string Message,
    DateTime OccurredAt);
