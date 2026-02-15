using CrownCommerce.Notification.Application.Email;
using CrownCommerce.Notification.Core.Entities;
using CrownCommerce.Notification.Core.Enums;
using CrownCommerce.Notification.Core.Interfaces;
using CrownCommerce.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Notification.Application.Consumers;

public sealed class CampaignCompletedNotificationConsumer(
    INotificationLogRepository repository,
    IEmailSender emailSender,
    IConfiguration configuration,
    ILogger<CampaignCompletedNotificationConsumer> logger) : IConsumer<CampaignCompletedEvent>
{
    public async Task Consume(ConsumeContext<CampaignCompletedEvent> context)
    {
        var evt = context.Message;

        logger.LogInformation("Campaign {CampaignId} completed. Sent: {TotalSent}, Failed: {TotalFailed}",
            evt.CampaignId, evt.TotalSent, evt.TotalFailed);

        var adminEmail = configuration["AdminEmail"] ?? "hello@originhairco.ca";
        var subject = $"Campaign Completed \u2014 {evt.TotalSent} sent, {evt.TotalFailed} failed";
        var htmlBody = EmailTemplates.CampaignCompleted(evt.CampaignId, "Newsletter Campaign", evt.TotalSent);

        var sent = await emailSender.SendEmailAsync(adminEmail, subject, htmlBody);

        var log = new NotificationLog
        {
            Id = Guid.NewGuid(),
            Recipient = adminEmail,
            Subject = subject,
            Type = NotificationType.NewsletterCampaign,
            Channel = NotificationChannel.Email,
            ReferenceId = evt.CampaignId,
            IsSent = sent,
            CreatedAt = DateTime.UtcNow,
            SentAt = sent ? DateTime.UtcNow : null
        };

        await repository.AddAsync(log);
    }
}
