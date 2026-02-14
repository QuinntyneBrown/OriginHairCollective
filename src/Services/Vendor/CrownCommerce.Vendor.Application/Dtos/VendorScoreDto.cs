namespace CrownCommerce.Vendor.Application.Dtos;

public sealed record VendorScoreDto(
    Guid Id,
    string Section,
    string CriterionNumber,
    string CriterionLabel,
    int Score,
    int MaxScore,
    string? Notes);
