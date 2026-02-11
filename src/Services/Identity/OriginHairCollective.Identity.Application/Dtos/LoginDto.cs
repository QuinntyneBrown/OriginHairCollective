namespace OriginHairCollective.Identity.Application.Dtos;

public sealed record LoginDto(
    string Email,
    string Password);
