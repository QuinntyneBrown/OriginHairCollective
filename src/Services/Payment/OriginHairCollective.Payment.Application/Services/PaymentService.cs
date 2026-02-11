using OriginHairCollective.Payment.Application.Dtos;
using OriginHairCollective.Payment.Application.Mapping;
using OriginHairCollective.Payment.Core.Entities;
using OriginHairCollective.Payment.Core.Enums;
using OriginHairCollective.Payment.Core.Interfaces;
using OriginHairCollective.Shared.Contracts;
using MassTransit;

namespace OriginHairCollective.Payment.Application.Services;

public sealed class PaymentService(
    IPaymentRepository paymentRepository,
    IRefundRepository refundRepository,
    IPublishEndpoint publishEndpoint) : IPaymentService
{
    public async Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto dto, CancellationToken ct = default)
    {
        if (!Enum.TryParse<PaymentMethod>(dto.PaymentMethod, true, out var method))
            throw new ArgumentException($"Invalid payment method: {dto.PaymentMethod}");

        var payment = new PaymentRecord
        {
            Id = Guid.NewGuid(),
            OrderId = dto.OrderId,
            CustomerEmail = dto.CustomerEmail,
            Amount = dto.Amount,
            Method = method,
            Status = PaymentStatus.Processing,
            CreatedAt = DateTime.UtcNow
        };

        await paymentRepository.AddAsync(payment, ct);
        return payment.ToDto();
    }

    public async Task<PaymentDto?> ConfirmPaymentAsync(Guid paymentId, string externalTransactionId, CancellationToken ct = default)
    {
        var payment = await paymentRepository.GetByIdAsync(paymentId, ct);
        if (payment is null) return null;

        payment.Status = PaymentStatus.Completed;
        payment.ExternalTransactionId = externalTransactionId;
        payment.CompletedAt = DateTime.UtcNow;

        await paymentRepository.UpdateAsync(payment, ct);

        await publishEndpoint.Publish(new PaymentCompletedEvent(
            payment.Id,
            payment.OrderId,
            payment.CustomerEmail,
            payment.Amount,
            payment.Method.ToString(),
            DateTime.UtcNow), ct);

        return payment.ToDto();
    }

    public async Task<PaymentDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var payment = await paymentRepository.GetByIdAsync(id, ct);
        return payment?.ToDto();
    }

    public async Task<PaymentDto?> GetByOrderIdAsync(Guid orderId, CancellationToken ct = default)
    {
        var payment = await paymentRepository.GetByOrderIdAsync(orderId, ct);
        return payment?.ToDto();
    }

    public async Task<RefundDto> IssueRefundAsync(CreateRefundDto dto, CancellationToken ct = default)
    {
        var payment = await paymentRepository.GetByIdAsync(dto.PaymentId, ct)
            ?? throw new InvalidOperationException("Payment not found.");

        payment.Status = PaymentStatus.Refunded;
        await paymentRepository.UpdateAsync(payment, ct);

        var refund = new RefundRecord
        {
            Id = Guid.NewGuid(),
            PaymentId = payment.Id,
            OrderId = payment.OrderId,
            CustomerEmail = payment.CustomerEmail,
            Amount = dto.Amount,
            Reason = dto.Reason,
            CreatedAt = DateTime.UtcNow
        };

        await refundRepository.AddAsync(refund, ct);

        await publishEndpoint.Publish(new RefundIssuedEvent(
            refund.Id,
            refund.OrderId,
            refund.PaymentId,
            refund.CustomerEmail,
            refund.Amount,
            refund.Reason,
            DateTime.UtcNow), ct);

        return refund.ToDto();
    }
}
