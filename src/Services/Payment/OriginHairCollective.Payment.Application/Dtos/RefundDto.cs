namespace OriginHairCollective.Payment.Application.Dtos;

public sealed record RefundDto(
    Guid Id,
    Guid PaymentId,
    Guid OrderId,
    string CustomerEmail,
    decimal Amount,
    string Reason,
    DateTime CreatedAt);
