using OriginHairCollective.Notification.Core.Entities;
using OriginHairCollective.Notification.Core.Interfaces;
using OriginHairCollective.Notification.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Notification.Infrastructure.Repositories;

public sealed class NotificationLogRepository(NotificationDbContext context) : INotificationLogRepository
{
    public async Task<IReadOnlyList<NotificationLog>> GetAllAsync(CancellationToken ct = default)
    {
        return await context.NotificationLogs
            .AsNoTracking()
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<NotificationLog>> GetByRecipientAsync(string recipient, CancellationToken ct = default)
    {
        return await context.NotificationLogs
            .AsNoTracking()
            .Where(n => n.Recipient == recipient)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<NotificationLog> AddAsync(NotificationLog log, CancellationToken ct = default)
    {
        context.NotificationLogs.Add(log);
        await context.SaveChangesAsync(ct);
        return log;
    }

    public async Task UpdateAsync(NotificationLog log, CancellationToken ct = default)
    {
        context.NotificationLogs.Update(log);
        await context.SaveChangesAsync(ct);
    }
}
