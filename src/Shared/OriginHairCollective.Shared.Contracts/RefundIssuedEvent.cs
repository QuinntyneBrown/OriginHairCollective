namespace OriginHairCollective.Shared.Contracts;

public sealed record RefundIssuedEvent(
    Guid RefundId,
    Guid OrderId,
    Guid PaymentId,
    string CustomerEmail,
    decimal Amount,
    string Reason,
    DateTime OccurredAt);
