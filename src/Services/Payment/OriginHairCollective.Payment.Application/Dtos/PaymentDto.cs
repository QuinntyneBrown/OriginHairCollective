namespace OriginHairCollective.Payment.Application.Dtos;

public sealed record PaymentDto(
    Guid Id,
    Guid OrderId,
    string CustomerEmail,
    decimal Amount,
    string Method,
    string Status,
    string? ExternalTransactionId,
    string? FailureReason,
    DateTime CreatedAt,
    DateTime? CompletedAt);
