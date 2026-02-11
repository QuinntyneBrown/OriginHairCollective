namespace OriginHairCollective.Identity.Application.Dtos;

public sealed record RegisterDto(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? Phone);
