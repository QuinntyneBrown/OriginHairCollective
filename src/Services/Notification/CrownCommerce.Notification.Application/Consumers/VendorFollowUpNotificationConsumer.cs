using CrownCommerce.Notification.Core.Entities;
using CrownCommerce.Notification.Core.Enums;
using CrownCommerce.Notification.Core.Interfaces;
using CrownCommerce.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Notification.Application.Consumers;

public sealed class VendorFollowUpNotificationConsumer(
    INotificationLogRepository repository,
    ILogger<VendorFollowUpNotificationConsumer> logger) : IConsumer<VendorFollowUpRequestedEvent>
{
    public async Task Consume(ConsumeContext<VendorFollowUpRequestedEvent> context)
    {
        var evt = context.Message;

        logger.LogInformation(
            "Processing vendor follow-up email to {VendorName} ({Email}) - Subject: {Subject}",
            evt.VendorName, evt.VendorEmail, evt.Subject);

        var log = new NotificationLog
        {
            Id = Guid.NewGuid(),
            Recipient = evt.VendorEmail,
            Subject = evt.Subject,
            Type = NotificationType.VendorFollowUp,
            Channel = NotificationChannel.Email,
            ReferenceId = evt.VendorId,
            IsSent = true,
            CreatedAt = DateTime.UtcNow,
            SentAt = DateTime.UtcNow
        };

        await repository.AddAsync(log);

        logger.LogInformation(
            "Vendor follow-up notification logged for {VendorName} (FollowUp: {FollowUpId})",
            evt.VendorName, evt.FollowUpId);
    }
}
