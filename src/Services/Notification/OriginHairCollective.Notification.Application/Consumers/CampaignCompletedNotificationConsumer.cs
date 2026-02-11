using OriginHairCollective.Notification.Core.Entities;
using OriginHairCollective.Notification.Core.Enums;
using OriginHairCollective.Notification.Core.Interfaces;
using OriginHairCollective.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace OriginHairCollective.Notification.Application.Consumers;

public sealed class CampaignCompletedNotificationConsumer(
    INotificationLogRepository repository,
    ILogger<CampaignCompletedNotificationConsumer> logger) : IConsumer<CampaignCompletedEvent>
{
    public async Task Consume(ConsumeContext<CampaignCompletedEvent> context)
    {
        var evt = context.Message;

        logger.LogInformation("Campaign {CampaignId} completed. Sent: {TotalSent}, Failed: {TotalFailed}",
            evt.CampaignId, evt.TotalSent, evt.TotalFailed);

        var log = new NotificationLog
        {
            Id = Guid.NewGuid(),
            Recipient = "system",
            Subject = $"Campaign Completed — {evt.TotalSent} sent, {evt.TotalFailed} failed",
            Type = NotificationType.NewsletterCampaign,
            Channel = NotificationChannel.System,
            ReferenceId = evt.CampaignId,
            IsSent = true,
            CreatedAt = DateTime.UtcNow,
            SentAt = DateTime.UtcNow
        };

        await repository.AddAsync(log);
    }
}
