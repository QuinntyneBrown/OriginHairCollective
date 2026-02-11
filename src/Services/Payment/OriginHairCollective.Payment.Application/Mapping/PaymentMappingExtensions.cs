using OriginHairCollective.Payment.Application.Dtos;
using OriginHairCollective.Payment.Core.Entities;

namespace OriginHairCollective.Payment.Application.Mapping;

public static class PaymentMappingExtensions
{
    public static PaymentDto ToDto(this PaymentRecord payment) =>
        new(
            payment.Id,
            payment.OrderId,
            payment.CustomerEmail,
            payment.Amount,
            payment.Method.ToString(),
            payment.Status.ToString(),
            payment.ExternalTransactionId,
            payment.FailureReason,
            payment.CreatedAt,
            payment.CompletedAt);

    public static RefundDto ToDto(this RefundRecord refund) =>
        new(
            refund.Id,
            refund.PaymentId,
            refund.OrderId,
            refund.CustomerEmail,
            refund.Amount,
            refund.Reason,
            refund.CreatedAt);
}
