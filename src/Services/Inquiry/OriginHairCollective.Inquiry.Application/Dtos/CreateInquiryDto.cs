namespace OriginHairCollective.Inquiry.Application.Dtos;

public sealed record CreateInquiryDto(
    string Name,
    string Email,
    string? Phone,
    string Message,
    Guid? ProductId);
