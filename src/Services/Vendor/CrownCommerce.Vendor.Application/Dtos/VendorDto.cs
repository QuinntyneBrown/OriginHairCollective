namespace CrownCommerce.Vendor.Application.Dtos;

public sealed record VendorDto(
    Guid Id,
    string CompanyName,
    string Platform,
    string ContactName,
    string ContactEmail,
    string? ContactWhatsApp,
    string? FactoryLocation,
    string HairOriginCountry,
    string? WebsiteUrl,
    DateTime? DateEvaluated,
    string? EvaluatedBy,
    string? Notes,
    string Status,
    int GrandTotal,
    int MaxTotal,
    string Rating,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
