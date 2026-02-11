namespace OriginHairCollective.Payment.Application.Dtos;

public sealed record CreatePaymentDto(
    Guid OrderId,
    string CustomerEmail,
    decimal Amount,
    string PaymentMethod);
