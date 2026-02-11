using OriginHairCollective.Notification.Application.Dtos;
using OriginHairCollective.Notification.Application.Mapping;
using OriginHairCollective.Notification.Core.Interfaces;

namespace OriginHairCollective.Notification.Application.Services;

public sealed class NotificationService(INotificationLogRepository repository) : INotificationService
{
    public async Task<IReadOnlyList<NotificationLogDto>> GetAllAsync(CancellationToken ct = default)
    {
        var logs = await repository.GetAllAsync(ct);
        return logs.Select(l => l.ToDto()).ToList();
    }

    public async Task<IReadOnlyList<NotificationLogDto>> GetByRecipientAsync(string recipient, CancellationToken ct = default)
    {
        var logs = await repository.GetByRecipientAsync(recipient, ct);
        return logs.Select(l => l.ToDto()).ToList();
    }
}
