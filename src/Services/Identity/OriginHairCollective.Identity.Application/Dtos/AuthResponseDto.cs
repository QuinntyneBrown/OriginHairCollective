namespace OriginHairCollective.Identity.Application.Dtos;

public sealed record AuthResponseDto(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    string Token);
