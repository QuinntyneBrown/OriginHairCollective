namespace OriginHairCollective.Catalog.Application.Dtos;

public sealed record HairProductDto(
    Guid Id,
    string Name,
    Guid OriginId,
    string OriginCountry,
    string Texture,
    string Type,
    int LengthInches,
    decimal Price,
    string Description,
    string? ImageUrl);
