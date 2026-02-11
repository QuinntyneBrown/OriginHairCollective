namespace OriginHairCollective.Content.Application.Dtos;

public sealed record GalleryImageDto(
    Guid Id,
    string Title,
    string? Description,
    string ImageUrl,
    string Category,
    DateTime CreatedAt);
