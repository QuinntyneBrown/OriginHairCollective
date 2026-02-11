namespace OriginHairCollective.Shared.Contracts;

public sealed record CampaignCompletedEvent(
    Guid CampaignId,
    int TotalSent,
    int TotalFailed,
    DateTime OccurredAt);
