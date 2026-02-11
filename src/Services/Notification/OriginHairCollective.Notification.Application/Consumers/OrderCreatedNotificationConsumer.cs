using OriginHairCollective.Notification.Core.Entities;
using OriginHairCollective.Notification.Core.Enums;
using OriginHairCollective.Notification.Core.Interfaces;
using OriginHairCollective.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace OriginHairCollective.Notification.Application.Consumers;

public sealed class OrderCreatedNotificationConsumer(
    INotificationLogRepository repository,
    ILogger<OrderCreatedNotificationConsumer> logger) : IConsumer<OrderCreatedEvent>
{
    public async Task Consume(ConsumeContext<OrderCreatedEvent> context)
    {
        var evt = context.Message;
        logger.LogInformation("Sending order confirmation to {Email} for Order {OrderId}", evt.CustomerEmail, evt.OrderId);

        var log = new NotificationLog
        {
            Id = Guid.NewGuid(),
            Recipient = evt.CustomerEmail,
            Subject = $"Order Confirmation — #{evt.OrderId.ToString()[..8].ToUpperInvariant()}",
            Type = NotificationType.OrderConfirmation,
            Channel = NotificationChannel.Email,
            ReferenceId = evt.OrderId,
            IsSent = true,
            CreatedAt = DateTime.UtcNow,
            SentAt = DateTime.UtcNow
        };

        await repository.AddAsync(log);
    }
}
