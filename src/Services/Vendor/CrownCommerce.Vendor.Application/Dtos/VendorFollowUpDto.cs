namespace CrownCommerce.Vendor.Application.Dtos;

public sealed record VendorFollowUpDto(
    Guid Id,
    Guid VendorId,
    string Subject,
    string Body,
    bool IsSent,
    string? ErrorMessage,
    DateTime CreatedAt,
    DateTime? SentAt);
