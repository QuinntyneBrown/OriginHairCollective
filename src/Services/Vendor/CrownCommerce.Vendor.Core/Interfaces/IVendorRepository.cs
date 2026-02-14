using CrownCommerce.Vendor.Core.Entities;
using CrownCommerce.Vendor.Core.Enums;

namespace CrownCommerce.Vendor.Core.Interfaces;

public interface IVendorRepository
{
    Task<IReadOnlyList<Entities.Vendor>> GetAllAsync(CancellationToken ct = default);
    Task<Entities.Vendor?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Entities.Vendor>> GetByStatusAsync(VendorStatus status, CancellationToken ct = default);
    Task<Entities.Vendor> AddAsync(Entities.Vendor vendor, CancellationToken ct = default);
    Task UpdateAsync(Entities.Vendor vendor, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task AddScoresAsync(IEnumerable<VendorScore> scores, CancellationToken ct = default);
    Task UpdateScoresAsync(IEnumerable<VendorScore> scores, CancellationToken ct = default);
    Task AddRedFlagsAsync(IEnumerable<VendorRedFlag> redFlags, CancellationToken ct = default);
    Task UpdateRedFlagsAsync(IEnumerable<VendorRedFlag> redFlags, CancellationToken ct = default);
    Task<VendorFollowUp> AddFollowUpAsync(VendorFollowUp followUp, CancellationToken ct = default);
    Task<IReadOnlyList<VendorFollowUp>> GetFollowUpsByVendorIdAsync(Guid vendorId, CancellationToken ct = default);
}
