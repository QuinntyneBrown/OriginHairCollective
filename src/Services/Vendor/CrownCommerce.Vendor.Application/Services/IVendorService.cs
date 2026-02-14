using CrownCommerce.Vendor.Application.Dtos;

namespace CrownCommerce.Vendor.Application.Services;

public interface IVendorService
{
    Task<IReadOnlyList<VendorDto>> GetAllAsync(CancellationToken ct = default);
    Task<VendorDetailDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<VendorDto>> GetByStatusAsync(string status, CancellationToken ct = default);
    Task<VendorDto> CreateAsync(CreateVendorDto dto, CancellationToken ct = default);
    Task<VendorDto?> UpdateAsync(Guid id, UpdateVendorDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<VendorScoreDto>> SaveScoresAsync(Guid vendorId, SaveScoresDto dto, CancellationToken ct = default);
    Task<IReadOnlyList<VendorRedFlagDto>> SaveRedFlagsAsync(Guid vendorId, SaveRedFlagsDto dto, CancellationToken ct = default);
    Task<VendorFollowUpDto?> SendFollowUpAsync(Guid vendorId, CreateFollowUpDto dto, CancellationToken ct = default);
    Task<IReadOnlyList<VendorFollowUpDto>> GetFollowUpsAsync(Guid vendorId, CancellationToken ct = default);
}
