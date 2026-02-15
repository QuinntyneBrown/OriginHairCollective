using CrownCommerce.Notification.Application.Email;
using CrownCommerce.Notification.Core.Entities;
using CrownCommerce.Notification.Core.Enums;
using CrownCommerce.Notification.Core.Interfaces;
using CrownCommerce.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Notification.Application.Consumers;

public sealed class OrderStatusChangedNotificationConsumer(
    INotificationLogRepository repository,
    IEmailSender emailSender,
    ILogger<OrderStatusChangedNotificationConsumer> logger) : IConsumer<OrderStatusChangedEvent>
{
    public async Task Consume(ConsumeContext<OrderStatusChangedEvent> context)
    {
        var evt = context.Message;

        if (evt.NewStatus != "Shipped") return;

        logger.LogInformation("Sending shipping update to {Email} for Order {OrderId}", evt.CustomerEmail, evt.OrderId);

        var subject = $"Your Order Has Shipped \u2014 Tracking: {evt.TrackingNumber ?? "N/A"}";
        var htmlBody = EmailTemplates.OrderStatusUpdate(evt.OrderId, evt.NewStatus);

        var sent = await emailSender.SendEmailAsync(evt.CustomerEmail, subject, htmlBody);

        var log = new NotificationLog
        {
            Id = Guid.NewGuid(),
            Recipient = evt.CustomerEmail,
            Subject = subject,
            Type = NotificationType.ShippingUpdate,
            Channel = NotificationChannel.Email,
            ReferenceId = evt.OrderId,
            IsSent = sent,
            CreatedAt = DateTime.UtcNow,
            SentAt = sent ? DateTime.UtcNow : null
        };

        await repository.AddAsync(log);
    }
}
