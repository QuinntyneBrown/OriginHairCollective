using OriginHairCollective.Notification.Application.Dtos;
using OriginHairCollective.Notification.Core.Entities;

namespace OriginHairCollective.Notification.Application.Mapping;

public static class NotificationMappingExtensions
{
    public static NotificationLogDto ToDto(this NotificationLog log) =>
        new(
            log.Id,
            log.Recipient,
            log.Subject,
            log.Type.ToString(),
            log.Channel.ToString(),
            log.ReferenceId,
            log.IsSent,
            log.ErrorMessage,
            log.CreatedAt,
            log.SentAt);
}
