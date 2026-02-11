namespace OriginHairCollective.Shared.Contracts;

public sealed record UserRegisteredEvent(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    bool NewsletterOptIn,
    DateTime OccurredAt);
