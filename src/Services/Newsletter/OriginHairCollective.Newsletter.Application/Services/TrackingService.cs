using OriginHairCollective.Newsletter.Core.Enums;
using OriginHairCollective.Newsletter.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace OriginHairCollective.Newsletter.Application.Services;

public sealed class TrackingService(
    ICampaignRecipientRepository recipientRepository,
    ICampaignRepository campaignRepository,
    ILogger<TrackingService> logger) : ITrackingService
{
    public async Task RecordOpenAsync(Guid campaignId, Guid subscriberId, CancellationToken ct = default)
    {
        var (recipients, _) = await recipientRepository.GetPagedByCampaignAsync(campaignId, 1, 1, null, ct);
        var recipient = recipients.FirstOrDefault(r => r.SubscriberId == subscriberId);

        if (recipient is null || recipient.OpenedAt.HasValue)
            return;

        recipient.OpenedAt = DateTime.UtcNow;
        if (recipient.Status is DeliveryStatus.Sent or DeliveryStatus.Delivered)
            recipient.Status = DeliveryStatus.Opened;

        await recipientRepository.UpdateAsync(recipient, ct);

        var campaign = await campaignRepository.GetByIdAsync(campaignId, ct);
        if (campaign is not null)
        {
            campaign.TotalOpened++;
            await campaignRepository.UpdateAsync(campaign, ct);
        }

        logger.LogInformation("Recorded open for campaign {CampaignId}, subscriber {SubscriberId}", campaignId, subscriberId);
    }

    public async Task<string> RecordClickAsync(Guid campaignId, Guid subscriberId, string targetUrl, CancellationToken ct = default)
    {
        var (recipients, _) = await recipientRepository.GetPagedByCampaignAsync(campaignId, 1, 1, null, ct);
        var recipient = recipients.FirstOrDefault(r => r.SubscriberId == subscriberId);

        if (recipient is not null && !recipient.ClickedAt.HasValue)
        {
            recipient.ClickedAt = DateTime.UtcNow;
            if (recipient.Status is DeliveryStatus.Sent or DeliveryStatus.Delivered or DeliveryStatus.Opened)
                recipient.Status = DeliveryStatus.Clicked;

            await recipientRepository.UpdateAsync(recipient, ct);

            var campaign = await campaignRepository.GetByIdAsync(campaignId, ct);
            if (campaign is not null)
            {
                campaign.TotalClicked++;
                await campaignRepository.UpdateAsync(campaign, ct);
            }

            logger.LogInformation("Recorded click for campaign {CampaignId}, subscriber {SubscriberId}", campaignId, subscriberId);
        }

        return targetUrl;
    }
}
