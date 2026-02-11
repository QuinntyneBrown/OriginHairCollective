namespace OriginHairCollective.Identity.Application.Dtos;

public sealed record UpdateProfileDto(
    string FirstName,
    string LastName,
    string? Phone);
