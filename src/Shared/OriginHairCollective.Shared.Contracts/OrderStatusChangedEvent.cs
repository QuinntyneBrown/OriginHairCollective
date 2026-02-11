namespace OriginHairCollective.Shared.Contracts;

public sealed record OrderStatusChangedEvent(
    Guid OrderId,
    Guid? UserId,
    string CustomerEmail,
    string NewStatus,
    string? TrackingNumber,
    DateTime OccurredAt);
