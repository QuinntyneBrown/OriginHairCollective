using CrownCommerce.Notification.Application.Email;
using CrownCommerce.Notification.Core.Entities;
using CrownCommerce.Notification.Core.Enums;
using CrownCommerce.Notification.Core.Interfaces;
using CrownCommerce.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Notification.Application.Consumers;

public sealed class InquiryReceivedNotificationConsumer(
    INotificationLogRepository repository,
    IEmailSender emailSender,
    ILogger<InquiryReceivedNotificationConsumer> logger) : IConsumer<InquiryReceivedEvent>
{
    public async Task Consume(ConsumeContext<InquiryReceivedEvent> context)
    {
        var evt = context.Message;
        var type = evt.IsWholesale ? NotificationType.WholesaleFollowUp : NotificationType.InquiryAcknowledgment;
        var subject = evt.IsWholesale
            ? "Wholesale Inquiry Received \u2014 We'll Be in Touch"
            : "We Received Your Message \u2014 Origin Hair Collective";

        logger.LogInformation("Sending inquiry acknowledgment to {Email}", evt.CustomerEmail);

        var htmlBody = EmailTemplates.InquiryConfirmation(evt.CustomerName);
        var plainBody = EmailTemplates.InquiryConfirmationPlain(evt.CustomerName);

        var sent = await emailSender.SendEmailAsync(evt.CustomerEmail, subject, htmlBody, plainBody);

        var log = new NotificationLog
        {
            Id = Guid.NewGuid(),
            Recipient = evt.CustomerEmail,
            Subject = subject,
            Type = type,
            Channel = NotificationChannel.Email,
            ReferenceId = evt.InquiryId,
            IsSent = sent,
            CreatedAt = DateTime.UtcNow,
            SentAt = sent ? DateTime.UtcNow : null
        };

        await repository.AddAsync(log);
    }
}
