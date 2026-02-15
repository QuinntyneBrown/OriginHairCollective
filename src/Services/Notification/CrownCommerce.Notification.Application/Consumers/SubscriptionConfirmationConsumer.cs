using CrownCommerce.Notification.Application.Email;
using CrownCommerce.Notification.Core.Entities;
using CrownCommerce.Notification.Core.Enums;
using CrownCommerce.Notification.Core.Interfaces;
using CrownCommerce.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Notification.Application.Consumers;

public sealed class SubscriptionConfirmationConsumer(
    INotificationLogRepository repository,
    IEmailSender emailSender,
    ILogger<SubscriptionConfirmationConsumer> logger) : IConsumer<SubscriptionRequestedEvent>
{
    public async Task Consume(ConsumeContext<SubscriptionRequestedEvent> context)
    {
        var evt = context.Message;

        logger.LogInformation("Sending newsletter confirmation email to {Email}", evt.Email);

        var subject = "Welcome to the Collective \u2014 Origin Hair Collective";
        var htmlBody = EmailTemplates.NewsletterWelcome(evt.Email);
        var plainBody = EmailTemplates.NewsletterWelcomePlain();

        var sent = await emailSender.SendEmailAsync(evt.Email, subject, htmlBody, plainBody);

        var log = new NotificationLog
        {
            Id = Guid.NewGuid(),
            Recipient = evt.Email,
            Subject = subject,
            Type = NotificationType.NewsletterConfirmation,
            Channel = NotificationChannel.Email,
            ReferenceId = evt.SubscriberId,
            IsSent = sent,
            CreatedAt = DateTime.UtcNow,
            SentAt = sent ? DateTime.UtcNow : null
        };

        await repository.AddAsync(log);
    }
}
