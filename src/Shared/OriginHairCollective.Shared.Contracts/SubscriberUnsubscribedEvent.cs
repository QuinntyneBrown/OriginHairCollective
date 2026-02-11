namespace OriginHairCollective.Shared.Contracts;

public sealed record SubscriberUnsubscribedEvent(
    Guid SubscriberId,
    string Email,
    DateTime OccurredAt);
