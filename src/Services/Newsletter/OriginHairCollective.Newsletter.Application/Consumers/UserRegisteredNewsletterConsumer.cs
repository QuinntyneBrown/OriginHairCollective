using OriginHairCollective.Newsletter.Core.Entities;
using OriginHairCollective.Newsletter.Core.Enums;
using OriginHairCollective.Newsletter.Core.Interfaces;
using OriginHairCollective.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace OriginHairCollective.Newsletter.Application.Consumers;

public sealed class UserRegisteredNewsletterConsumer(
    ISubscriberRepository subscriberRepository,
    ILogger<UserRegisteredNewsletterConsumer> logger) : IConsumer<UserRegisteredEvent>
{
    public async Task Consume(ConsumeContext<UserRegisteredEvent> context)
    {
        var evt = context.Message;

        if (!evt.NewsletterOptIn)
            return;

        var normalizedEmail = evt.Email.Trim().ToLowerInvariant();
        var existing = await subscriberRepository.GetByEmailAsync(normalizedEmail);

        if (existing is not null)
        {
            if (existing.Status == SubscriberStatus.Active)
            {
                // Already subscribed; link UserId if not set
                if (!existing.UserId.HasValue)
                {
                    existing.UserId = evt.UserId;
                    await subscriberRepository.UpdateAsync(existing);
                }
                return;
            }

            // Reactivate
            existing.Status = SubscriberStatus.Active;
            existing.UserId = evt.UserId;
            existing.ConfirmedAt = DateTime.UtcNow;
            existing.ConfirmationToken = null;
            existing.UnsubscribedAt = null;
            await subscriberRepository.UpdateAsync(existing);

            logger.LogInformation("Reactivated subscriber {Email} via user registration", normalizedEmail);
            return;
        }

        var subscriber = new Subscriber
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            FirstName = evt.FirstName,
            LastName = evt.LastName,
            UserId = evt.UserId,
            Status = SubscriberStatus.Active,
            ConfirmedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        await subscriberRepository.AddAsync(subscriber);

        logger.LogInformation("Auto-subscribed {Email} via user registration", normalizedEmail);
    }
}
