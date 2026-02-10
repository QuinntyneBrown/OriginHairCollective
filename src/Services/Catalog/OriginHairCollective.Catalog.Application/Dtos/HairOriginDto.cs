namespace OriginHairCollective.Catalog.Application.Dtos;

public sealed record HairOriginDto(
    Guid Id,
    string Country,
    string Region,
    string Description);
