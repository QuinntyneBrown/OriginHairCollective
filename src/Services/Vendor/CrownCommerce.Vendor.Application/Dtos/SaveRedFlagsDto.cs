namespace CrownCommerce.Vendor.Application.Dtos;

public sealed record SaveRedFlagsDto(IReadOnlyList<RedFlagItemDto> RedFlags);

public sealed record RedFlagItemDto(
    string Description,
    bool IsCleared);
