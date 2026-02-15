using CrownCommerce.Notification.Application.Email;
using CrownCommerce.Notification.Core.Entities;
using CrownCommerce.Notification.Core.Enums;
using CrownCommerce.Notification.Core.Interfaces;
using CrownCommerce.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Notification.Application.Consumers;

public sealed class PaymentCompletedNotificationConsumer(
    INotificationLogRepository repository,
    IEmailSender emailSender,
    ILogger<PaymentCompletedNotificationConsumer> logger) : IConsumer<PaymentCompletedEvent>
{
    public async Task Consume(ConsumeContext<PaymentCompletedEvent> context)
    {
        var evt = context.Message;
        logger.LogInformation("Sending payment receipt to {Email} for Payment {PaymentId}", evt.CustomerEmail, evt.PaymentId);

        var subject = $"Payment Receipt \u2014 ${evt.Amount:F2}";
        var htmlBody = EmailTemplates.PaymentReceipt(evt.PaymentId, evt.Amount, evt.CustomerEmail);
        var plainBody = EmailTemplates.PaymentReceiptPlain(evt.PaymentId, evt.Amount);

        var sent = await emailSender.SendEmailAsync(evt.CustomerEmail, subject, htmlBody, plainBody);

        var log = new NotificationLog
        {
            Id = Guid.NewGuid(),
            Recipient = evt.CustomerEmail,
            Subject = subject,
            Type = NotificationType.PaymentReceipt,
            Channel = NotificationChannel.Email,
            ReferenceId = evt.PaymentId,
            IsSent = sent,
            CreatedAt = DateTime.UtcNow,
            SentAt = sent ? DateTime.UtcNow : null
        };

        await repository.AddAsync(log);
    }
}
