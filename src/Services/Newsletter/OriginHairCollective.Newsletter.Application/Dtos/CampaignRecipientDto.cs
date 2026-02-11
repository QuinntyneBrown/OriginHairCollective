namespace OriginHairCollective.Newsletter.Application.Dtos;

public sealed record CampaignRecipientDto(
    Guid Id,
    string Email,
    string Status,
    DateTime? SentAt,
    DateTime? OpenedAt,
    DateTime? ClickedAt,
    string? ErrorMessage);
