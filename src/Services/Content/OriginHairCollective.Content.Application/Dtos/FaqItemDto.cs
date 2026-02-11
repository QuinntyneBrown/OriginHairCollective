namespace OriginHairCollective.Content.Application.Dtos;

public sealed record FaqItemDto(
    Guid Id,
    string Question,
    string Answer,
    string Category);
