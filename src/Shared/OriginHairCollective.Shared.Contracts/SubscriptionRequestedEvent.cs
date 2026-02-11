namespace OriginHairCollective.Shared.Contracts;

public sealed record SubscriptionRequestedEvent(
    Guid SubscriberId,
    string Email,
    string? FirstName,
    string ConfirmationToken,
    DateTime OccurredAt);
