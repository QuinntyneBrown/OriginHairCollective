using CrownCommerce.Notification.Application.Email;
using CrownCommerce.Notification.Core.Entities;
using CrownCommerce.Notification.Core.Enums;
using CrownCommerce.Notification.Core.Interfaces;
using CrownCommerce.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Notification.Application.Consumers;

public sealed class OrderCreatedNotificationConsumer(
    INotificationLogRepository repository,
    IEmailSender emailSender,
    ILogger<OrderCreatedNotificationConsumer> logger) : IConsumer<OrderCreatedEvent>
{
    public async Task Consume(ConsumeContext<OrderCreatedEvent> context)
    {
        var evt = context.Message;
        logger.LogInformation("Sending order confirmation to {Email} for Order {OrderId}", evt.CustomerEmail, evt.OrderId);

        var subject = $"Order Confirmation \u2014 #{evt.OrderId.ToString()[..8].ToUpperInvariant()}";
        var htmlBody = EmailTemplates.OrderConfirmation(evt.OrderId, evt.CustomerEmail, evt.TotalAmount);
        var plainBody = EmailTemplates.OrderConfirmationPlain(evt.OrderId, evt.TotalAmount);

        var sent = await emailSender.SendEmailAsync(evt.CustomerEmail, subject, htmlBody, plainBody);

        var log = new NotificationLog
        {
            Id = Guid.NewGuid(),
            Recipient = evt.CustomerEmail,
            Subject = subject,
            Type = NotificationType.OrderConfirmation,
            Channel = NotificationChannel.Email,
            ReferenceId = evt.OrderId,
            IsSent = sent,
            CreatedAt = DateTime.UtcNow,
            SentAt = sent ? DateTime.UtcNow : null
        };

        await repository.AddAsync(log);
    }
}
