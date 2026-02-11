using OriginHairCollective.Payment.Application.Dtos;

namespace OriginHairCollective.Payment.Application.Services;

public interface IPaymentService
{
    Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto dto, CancellationToken ct = default);
    Task<PaymentDto?> ConfirmPaymentAsync(Guid paymentId, string externalTransactionId, CancellationToken ct = default);
    Task<PaymentDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PaymentDto?> GetByOrderIdAsync(Guid orderId, CancellationToken ct = default);
    Task<RefundDto> IssueRefundAsync(CreateRefundDto dto, CancellationToken ct = default);
}
