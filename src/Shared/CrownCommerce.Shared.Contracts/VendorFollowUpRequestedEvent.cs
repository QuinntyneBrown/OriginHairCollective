namespace CrownCommerce.Shared.Contracts;

public sealed record VendorFollowUpRequestedEvent(
    Guid FollowUpId,
    Guid VendorId,
    string VendorName,
    string VendorEmail,
    string ContactName,
    string Subject,
    string Body,
    DateTime OccurredAt);
