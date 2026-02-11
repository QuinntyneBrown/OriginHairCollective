namespace OriginHairCollective.Shared.Contracts;

public sealed record PaymentFailedEvent(
    Guid PaymentId,
    Guid OrderId,
    string CustomerEmail,
    decimal Amount,
    string FailureReason,
    DateTime OccurredAt);
