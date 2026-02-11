namespace OriginHairCollective.Shared.Contracts;

public sealed record PaymentCompletedEvent(
    Guid PaymentId,
    Guid OrderId,
    string CustomerEmail,
    decimal Amount,
    string PaymentMethod,
    DateTime OccurredAt);
