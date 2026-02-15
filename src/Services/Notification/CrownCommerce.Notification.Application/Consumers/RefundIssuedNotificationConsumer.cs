using CrownCommerce.Notification.Application.Email;
using CrownCommerce.Notification.Core.Entities;
using CrownCommerce.Notification.Core.Enums;
using CrownCommerce.Notification.Core.Interfaces;
using CrownCommerce.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Notification.Application.Consumers;

public sealed class RefundIssuedNotificationConsumer(
    INotificationLogRepository repository,
    IEmailSender emailSender,
    ILogger<RefundIssuedNotificationConsumer> logger) : IConsumer<RefundIssuedEvent>
{
    public async Task Consume(ConsumeContext<RefundIssuedEvent> context)
    {
        var evt = context.Message;
        logger.LogInformation("Sending refund confirmation to {Email} for Refund {RefundId}", evt.CustomerEmail, evt.RefundId);

        var subject = $"Refund Confirmation \u2014 ${evt.Amount:F2}";
        var htmlBody = EmailTemplates.RefundNotification(evt.OrderId, evt.Amount);

        var sent = await emailSender.SendEmailAsync(evt.CustomerEmail, subject, htmlBody);

        var log = new NotificationLog
        {
            Id = Guid.NewGuid(),
            Recipient = evt.CustomerEmail,
            Subject = subject,
            Type = NotificationType.RefundConfirmation,
            Channel = NotificationChannel.Email,
            ReferenceId = evt.RefundId,
            IsSent = sent,
            CreatedAt = DateTime.UtcNow,
            SentAt = sent ? DateTime.UtcNow : null
        };

        await repository.AddAsync(log);
    }
}
