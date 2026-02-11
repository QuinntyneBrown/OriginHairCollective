namespace OriginHairCollective.Content.Application.Dtos;

public sealed record TestimonialDto(
    Guid Id,
    string CustomerName,
    string? CustomerLocation,
    string Content,
    int Rating,
    string? ImageUrl,
    DateTime CreatedAt);
