namespace OriginHairCollective.Notification.Application.Dtos;

public sealed record NotificationLogDto(
    Guid Id,
    string Recipient,
    string Subject,
    string Type,
    string Channel,
    Guid? ReferenceId,
    bool IsSent,
    string? ErrorMessage,
    DateTime CreatedAt,
    DateTime? SentAt);
