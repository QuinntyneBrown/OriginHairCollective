using OriginHairCollective.Newsletter.Application.Email;
using OriginHairCollective.Newsletter.Core.Enums;
using OriginHairCollective.Newsletter.Core.Interfaces;
using OriginHairCollective.Shared.Contracts;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace OriginHairCollective.Newsletter.Application.Consumers;

public sealed class CampaignSendConsumer(
    ICampaignRepository campaignRepository,
    ICampaignRecipientRepository recipientRepository,
    ISubscriberRepository subscriberRepository,
    IEmailSender emailSender,
    IEmailContentProcessor contentProcessor,
    IConfiguration configuration,
    IPublishEndpoint publishEndpoint,
    ILogger<CampaignSendConsumer> logger) : IConsumer<CampaignSendRequestedEvent>
{
    public async Task Consume(ConsumeContext<CampaignSendRequestedEvent> context)
    {
        var evt = context.Message;
        var campaign = await campaignRepository.GetByIdAsync(evt.CampaignId);
        if (campaign is null || campaign.Status != CampaignStatus.Sending)
            return;

        var batchSize = int.Parse(configuration["Newsletter:BatchSize"] ?? "50");
        var batchDelayMs = int.Parse(configuration["Newsletter:BatchDelayMs"] ?? "1000");
        var fromName = configuration["Email:FromName"] ?? "Origin Hair Collective";
        var fromEmail = configuration["Email:FromEmail"] ?? "newsletter@originhair.com";

        var totalSent = 0;
        var totalFailed = 0;

        logger.LogInformation("Starting campaign send for {CampaignId} with {TotalRecipients} recipients",
            campaign.Id, campaign.TotalRecipients);

        while (true)
        {
            var batch = await recipientRepository.GetQueuedByCampaignAsync(campaign.Id, batchSize);
            if (batch.Count == 0)
                break;

            var messages = new List<EmailMessage>(batch.Count);

            foreach (var recipient in batch)
            {
                var subscriber = await subscriberRepository.GetByIdAsync(recipient.SubscriberId);
                var unsubscribeToken = subscriber?.UnsubscribeToken ?? "";

                var processedHtml = contentProcessor.ProcessHtml(
                    campaign.HtmlBody, campaign.Id, recipient.SubscriberId, unsubscribeToken);

                var headers = new Dictionary<string, string>();
                if (!string.IsNullOrEmpty(unsubscribeToken))
                {
                    var baseUrl = configuration["Newsletter:BaseUrl"] ?? "https://originhair.com";
                    headers["List-Unsubscribe"] = $"<{baseUrl}/api/newsletters/unsubscribe?token={unsubscribeToken}>";
                    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
                }

                messages.Add(new EmailMessage(
                    recipient.Email,
                    campaign.Subject,
                    processedHtml,
                    campaign.PlainTextBody,
                    fromName,
                    fromEmail,
                    headers));
            }

            var results = await emailSender.SendBatchAsync(messages);

            for (var i = 0; i < batch.Count; i++)
            {
                var recipient = batch[i];
                var result = results[i];

                if (result.Success)
                {
                    recipient.Status = DeliveryStatus.Sent;
                    recipient.SentAt = DateTime.UtcNow;
                    totalSent++;
                }
                else
                {
                    recipient.Status = DeliveryStatus.Failed;
                    recipient.ErrorMessage = result.ErrorMessage;
                    totalFailed++;
                }
            }

            await recipientRepository.UpdateBatchAsync(batch.ToList());

            campaign.TotalSent = totalSent;
            campaign.TotalBounced = totalFailed;
            await campaignRepository.UpdateAsync(campaign);

            if (batchDelayMs > 0)
                await Task.Delay(batchDelayMs);
        }

        campaign.Status = CampaignStatus.Sent;
        campaign.SentAt = DateTime.UtcNow;
        campaign.TotalSent = totalSent;
        campaign.TotalBounced = totalFailed;
        await campaignRepository.UpdateAsync(campaign);

        await publishEndpoint.Publish(new CampaignCompletedEvent(
            campaign.Id, totalSent, totalFailed, DateTime.UtcNow));

        logger.LogInformation("Campaign {CampaignId} completed. Sent: {Sent}, Failed: {Failed}",
            campaign.Id, totalSent, totalFailed);
    }
}
