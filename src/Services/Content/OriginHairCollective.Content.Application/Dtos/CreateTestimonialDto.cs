namespace OriginHairCollective.Content.Application.Dtos;

public sealed record CreateTestimonialDto(
    string CustomerName,
    string? CustomerLocation,
    string Content,
    int Rating,
    string? ImageUrl);
