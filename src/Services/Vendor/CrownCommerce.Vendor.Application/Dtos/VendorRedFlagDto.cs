namespace CrownCommerce.Vendor.Application.Dtos;

public sealed record VendorRedFlagDto(
    Guid Id,
    string Description,
    bool IsCleared);
