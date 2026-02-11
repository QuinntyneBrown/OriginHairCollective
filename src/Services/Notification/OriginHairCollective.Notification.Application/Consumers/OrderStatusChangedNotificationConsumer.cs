using OriginHairCollective.Notification.Core.Entities;
using OriginHairCollective.Notification.Core.Enums;
using OriginHairCollective.Notification.Core.Interfaces;
using OriginHairCollective.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace OriginHairCollective.Notification.Application.Consumers;

public sealed class OrderStatusChangedNotificationConsumer(
    INotificationLogRepository repository,
    ILogger<OrderStatusChangedNotificationConsumer> logger) : IConsumer<OrderStatusChangedEvent>
{
    public async Task Consume(ConsumeContext<OrderStatusChangedEvent> context)
    {
        var evt = context.Message;

        if (evt.NewStatus != "Shipped") return;

        logger.LogInformation("Sending shipping update to {Email} for Order {OrderId}", evt.CustomerEmail, evt.OrderId);

        var log = new NotificationLog
        {
            Id = Guid.NewGuid(),
            Recipient = evt.CustomerEmail,
            Subject = $"Your Order Has Shipped — Tracking: {evt.TrackingNumber ?? "N/A"}",
            Type = NotificationType.ShippingUpdate,
            Channel = NotificationChannel.Email,
            ReferenceId = evt.OrderId,
            IsSent = true,
            CreatedAt = DateTime.UtcNow,
            SentAt = DateTime.UtcNow
        };

        await repository.AddAsync(log);
    }
}
