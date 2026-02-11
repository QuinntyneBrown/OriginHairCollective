namespace OriginHairCollective.Content.Application.Dtos;

public sealed record ContentPageDto(
    Guid Id,
    string Slug,
    string Title,
    string Body,
    DateTime CreatedAt);
