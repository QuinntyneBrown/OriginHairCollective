namespace OriginHairCollective.Shared.Contracts;

public sealed record CampaignSendRequestedEvent(
    Guid CampaignId,
    string Subject,
    int TotalRecipients,
    DateTime OccurredAt);
