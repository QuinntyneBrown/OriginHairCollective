using OriginHairCollective.Payment.Core.Entities;

namespace OriginHairCollective.Payment.Core.Interfaces;

public interface IRefundRepository
{
    Task<RefundRecord> AddAsync(RefundRecord refund, CancellationToken ct = default);
    Task<IReadOnlyList<RefundRecord>> GetByPaymentIdAsync(Guid paymentId, CancellationToken ct = default);
}
