namespace OriginHairCollective.Newsletter.Application.Dtos;

public sealed record UpdateCampaignDto(
    string? Subject,
    string? HtmlBody,
    string? PlainTextBody,
    string? TargetTag,
    DateTime? ScheduledAt);
