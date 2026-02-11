using System.Security.Cryptography;
using OriginHairCollective.Newsletter.Application.Dtos;
using OriginHairCollective.Newsletter.Core.Entities;
using OriginHairCollective.Newsletter.Core.Enums;
using OriginHairCollective.Newsletter.Core.Interfaces;
using OriginHairCollective.Shared.Contracts;
using MassTransit;

namespace OriginHairCollective.Newsletter.Application.Services;

public sealed class NewsletterSubscriptionService(
    ISubscriberRepository subscriberRepository,
    IPublishEndpoint publishEndpoint) : INewsletterSubscriptionService
{
    public async Task<SubscribeResponseDto> SubscribeAsync(SubscribeRequestDto request, CancellationToken ct = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var existing = await subscriberRepository.GetByEmailAsync(normalizedEmail, ct);

        if (existing is not null && existing.Status == SubscriberStatus.Active)
        {
            return new SubscribeResponseDto("You are already subscribed.");
        }

        var confirmationToken = GenerateToken();

        if (existing is not null)
        {
            // Re-subscribe: reset to Pending with a new token
            existing.Status = SubscriberStatus.Pending;
            existing.ConfirmationToken = confirmationToken;
            existing.FirstName = request.FirstName ?? existing.FirstName;
            existing.LastName = request.LastName ?? existing.LastName;
            existing.UnsubscribedAt = null;

            if (request.Tags is { Count: > 0 })
            {
                var existingTagNames = existing.Tags.Select(t => t.Tag).ToHashSet();
                foreach (var tag in request.Tags.Where(t => !existingTagNames.Contains(t)))
                {
                    existing.Tags.Add(new SubscriberTag
                    {
                        Id = Guid.NewGuid(),
                        SubscriberId = existing.Id,
                        Tag = tag,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            await subscriberRepository.UpdateAsync(existing, ct);

            await publishEndpoint.Publish(new SubscriptionRequestedEvent(
                existing.Id, normalizedEmail, existing.FirstName, confirmationToken, DateTime.UtcNow), ct);

            return new SubscribeResponseDto("A confirmation email has been sent to your address.");
        }

        var subscriber = new Subscriber
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Status = SubscriberStatus.Pending,
            ConfirmationToken = confirmationToken,
            CreatedAt = DateTime.UtcNow
        };

        if (request.Tags is { Count: > 0 })
        {
            foreach (var tag in request.Tags)
            {
                subscriber.Tags.Add(new SubscriberTag
                {
                    Id = Guid.NewGuid(),
                    SubscriberId = subscriber.Id,
                    Tag = tag,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await subscriberRepository.AddAsync(subscriber, ct);

        await publishEndpoint.Publish(new SubscriptionRequestedEvent(
            subscriber.Id, normalizedEmail, subscriber.FirstName, confirmationToken, DateTime.UtcNow), ct);

        return new SubscribeResponseDto("A confirmation email has been sent to your address.");
    }

    public async Task ConfirmAsync(string token, CancellationToken ct = default)
    {
        var subscriber = await subscriberRepository.GetByConfirmationTokenAsync(token, ct)
            ?? throw new InvalidOperationException("Invalid or expired confirmation token.");

        subscriber.Status = SubscriberStatus.Active;
        subscriber.ConfirmedAt = DateTime.UtcNow;
        subscriber.ConfirmationToken = null;
        subscriber.UnsubscribeToken = GenerateToken();

        await subscriberRepository.UpdateAsync(subscriber, ct);

        await publishEndpoint.Publish(new SubscriberConfirmedEvent(
            subscriber.Id, subscriber.Email, DateTime.UtcNow), ct);
    }

    public async Task UnsubscribeAsync(string token, CancellationToken ct = default)
    {
        var subscriber = await subscriberRepository.GetByUnsubscribeTokenAsync(token, ct)
            ?? throw new InvalidOperationException("Invalid unsubscribe token.");

        subscriber.Status = SubscriberStatus.Unsubscribed;
        subscriber.UnsubscribedAt = DateTime.UtcNow;

        await subscriberRepository.UpdateAsync(subscriber, ct);

        await publishEndpoint.Publish(new SubscriberUnsubscribedEvent(
            subscriber.Id, subscriber.Email, DateTime.UtcNow), ct);
    }

    private static string GenerateToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }
}
