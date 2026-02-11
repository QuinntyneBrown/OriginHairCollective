using OriginHairCollective.Newsletter.Application.Dtos;

namespace OriginHairCollective.Newsletter.Application.Services;

public interface INewsletterSubscriptionService
{
    Task<SubscribeResponseDto> SubscribeAsync(SubscribeRequestDto request, CancellationToken ct = default);
    Task ConfirmAsync(string token, CancellationToken ct = default);
    Task UnsubscribeAsync(string token, CancellationToken ct = default);
}
