using OriginHairCollective.Notification.Core.Entities;
using OriginHairCollective.Notification.Core.Enums;
using OriginHairCollective.Notification.Core.Interfaces;
using OriginHairCollective.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace OriginHairCollective.Notification.Application.Consumers;

public sealed class PaymentCompletedNotificationConsumer(
    INotificationLogRepository repository,
    ILogger<PaymentCompletedNotificationConsumer> logger) : IConsumer<PaymentCompletedEvent>
{
    public async Task Consume(ConsumeContext<PaymentCompletedEvent> context)
    {
        var evt = context.Message;
        logger.LogInformation("Sending payment receipt to {Email} for Payment {PaymentId}", evt.CustomerEmail, evt.PaymentId);

        var log = new NotificationLog
        {
            Id = Guid.NewGuid(),
            Recipient = evt.CustomerEmail,
            Subject = $"Payment Receipt — ${evt.Amount:F2}",
            Type = NotificationType.PaymentReceipt,
            Channel = NotificationChannel.Email,
            ReferenceId = evt.PaymentId,
            IsSent = true,
            CreatedAt = DateTime.UtcNow,
            SentAt = DateTime.UtcNow
        };

        await repository.AddAsync(log);
    }
}
