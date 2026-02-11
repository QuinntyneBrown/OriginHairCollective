namespace OriginHairCollective.Newsletter.Application.Dtos;

public sealed record SubscribeRequestDto(
    string Email,
    string? FirstName,
    string? LastName,
    List<string>? Tags);
