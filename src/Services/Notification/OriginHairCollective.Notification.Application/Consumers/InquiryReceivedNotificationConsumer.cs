using OriginHairCollective.Notification.Core.Entities;
using OriginHairCollective.Notification.Core.Enums;
using OriginHairCollective.Notification.Core.Interfaces;
using OriginHairCollective.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace OriginHairCollective.Notification.Application.Consumers;

public sealed class InquiryReceivedNotificationConsumer(
    INotificationLogRepository repository,
    ILogger<InquiryReceivedNotificationConsumer> logger) : IConsumer<InquiryReceivedEvent>
{
    public async Task Consume(ConsumeContext<InquiryReceivedEvent> context)
    {
        var evt = context.Message;
        var type = evt.IsWholesale ? NotificationType.WholesaleFollowUp : NotificationType.InquiryAcknowledgment;
        var subject = evt.IsWholesale
            ? "Wholesale Inquiry Received — We'll Be in Touch"
            : "We Received Your Message — Origin Hair Collective";

        logger.LogInformation("Sending inquiry acknowledgment to {Email}", evt.CustomerEmail);

        var log = new NotificationLog
        {
            Id = Guid.NewGuid(),
            Recipient = evt.CustomerEmail,
            Subject = subject,
            Type = type,
            Channel = NotificationChannel.Email,
            ReferenceId = evt.InquiryId,
            IsSent = true,
            CreatedAt = DateTime.UtcNow,
            SentAt = DateTime.UtcNow
        };

        await repository.AddAsync(log);
    }
}
