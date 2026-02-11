using OriginHairCollective.Notification.Core.Enums;

namespace OriginHairCollective.Notification.Core.Entities;

public sealed class NotificationLog
{
    public Guid Id { get; set; }
    public required string Recipient { get; set; }
    public required string Subject { get; set; }
    public NotificationType Type { get; set; }
    public NotificationChannel Channel { get; set; }
    public Guid? ReferenceId { get; set; }
    public bool IsSent { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? SentAt { get; set; }
}
