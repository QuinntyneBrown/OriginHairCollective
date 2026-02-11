namespace OriginHairCollective.Newsletter.Application.Dtos;

public sealed record CampaignDetailDto(
    Guid Id,
    string Subject,
    string HtmlBody,
    string? PlainTextBody,
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
    Guid CreatedByUserId,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
