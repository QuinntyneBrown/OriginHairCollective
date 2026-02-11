namespace OriginHairCollective.Newsletter.Application.Dtos;

public sealed record SubscriberDto(
    Guid Id,
    string Email,
    string? FirstName,
    string? LastName,
    string Status,
    List<string> Tags,
    DateTime? ConfirmedAt,
    DateTime CreatedAt,
    DateTime? UnsubscribedAt);
