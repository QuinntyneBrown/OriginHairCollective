namespace OriginHairCollective.Inquiry.Application.Dtos;

public sealed record InquiryDto(
    Guid Id,
    string Name,
    string Email,
    string? Phone,
    string Message,
    Guid? ProductId,
    DateTime CreatedAt);
