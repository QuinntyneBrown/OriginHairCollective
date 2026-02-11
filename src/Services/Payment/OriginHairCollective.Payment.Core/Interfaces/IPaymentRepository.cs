using OriginHairCollective.Payment.Core.Entities;

namespace OriginHairCollective.Payment.Core.Interfaces;

public interface IPaymentRepository
{
    Task<PaymentRecord?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PaymentRecord?> GetByOrderIdAsync(Guid orderId, CancellationToken ct = default);
    Task<PaymentRecord> AddAsync(PaymentRecord payment, CancellationToken ct = default);
    Task UpdateAsync(PaymentRecord payment, CancellationToken ct = default);
}
