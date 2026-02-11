namespace OriginHairCollective.Shared.Contracts;

public sealed record InquiryReceivedEvent(
    Guid InquiryId,
    string CustomerName,
    string CustomerEmail,
    string Message,
    bool IsWholesale,
    DateTime OccurredAt);
