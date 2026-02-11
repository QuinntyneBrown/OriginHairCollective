namespace OriginHairCollective.Shared.Contracts;

public sealed record SubscriberConfirmedEvent(
    Guid SubscriberId,
    string Email,
    DateTime OccurredAt);
