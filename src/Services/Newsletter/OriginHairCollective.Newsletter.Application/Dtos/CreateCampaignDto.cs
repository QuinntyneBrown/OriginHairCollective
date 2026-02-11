namespace OriginHairCollective.Newsletter.Application.Dtos;

public sealed record CreateCampaignDto(
    string Subject,
    string HtmlBody,
    string? PlainTextBody,
    string? TargetTag,
    DateTime? ScheduledAt);
