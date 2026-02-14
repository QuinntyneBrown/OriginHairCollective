namespace CrownCommerce.Vendor.Application.Dtos;

public sealed record UpdateVendorDto(
    string CompanyName,
    string Platform,
    string ContactName,
    string ContactEmail,
    string? ContactWhatsApp,
    string? FactoryLocation,
    string HairOriginCountry,
    string? WebsiteUrl,
    string? EvaluatedBy,
    string? Notes,
    string Status);
