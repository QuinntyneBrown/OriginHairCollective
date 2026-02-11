namespace OriginHairCollective.Newsletter.Application.Dtos;

public sealed record CampaignDto(
    Guid Id,
    string Subject,
    string Status,
    string? TargetTag,
    int TotalRecipients,
    int TotalSent,
    int TotalOpened,
    int TotalClicked,
    int TotalBounced,
    int TotalUnsubscribed,
    DateTime? ScheduledAt,
    DateTime? SentAt,
    DateTime CreatedAt);
