namespace OriginHairCollective.Payment.Application.Dtos;

public sealed record CreateRefundDto(
    Guid PaymentId,
    decimal Amount,
    string Reason);
