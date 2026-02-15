using CrownCommerce.Notification.Application.Email;
using CrownCommerce.Notification.Core.Entities;
using CrownCommerce.Notification.Core.Enums;
using CrownCommerce.Notification.Core.Interfaces;
using CrownCommerce.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Notification.Application.Consumers;

public sealed class ChatConversationStartedNotificationConsumer(
    INotificationLogRepository repository,
    IEmailSender emailSender,
    IConfiguration configuration,
    ILogger<ChatConversationStartedNotificationConsumer> logger) : IConsumer<ChatConversationStartedEvent>
{
    public async Task Consume(ConsumeContext<ChatConversationStartedEvent> context)
    {
        var evt = context.Message;
        var visitorName = evt.VisitorName ?? "Anonymous";

        logger.LogInformation(
            "Chat conversation started \u2014 ConversationId: {ConversationId}, Visitor: {VisitorName}",
            evt.ConversationId,
            visitorName);

        var adminEmail = configuration["AdminEmail"] ?? "hello@originhairco.ca";
        var subject = "Chat Conversation Started";
        var htmlBody = EmailTemplates.ChatStartedAdmin(evt.ConversationId, visitorName);

        var sent = await emailSender.SendEmailAsync(adminEmail, subject, htmlBody);

        var log = new NotificationLog
        {
            Id = Guid.NewGuid(),
            Recipient = adminEmail,
            Subject = subject,
            Type = NotificationType.ChatConversationStarted,
            Channel = NotificationChannel.Email,
            ReferenceId = evt.ConversationId,
            IsSent = sent,
            CreatedAt = DateTime.UtcNow,
            SentAt = sent ? DateTime.UtcNow : null
        };

        await repository.AddAsync(log);
    }
}
