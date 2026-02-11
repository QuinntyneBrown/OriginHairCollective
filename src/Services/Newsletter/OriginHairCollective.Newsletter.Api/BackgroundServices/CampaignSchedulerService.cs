using OriginHairCollective.Newsletter.Core.Entities;
using OriginHairCollective.Newsletter.Core.Enums;
using OriginHairCollective.Newsletter.Core.Interfaces;
using OriginHairCollective.Shared.Contracts;
using MassTransit;

namespace OriginHairCollective.Newsletter.Api.BackgroundServices;

public sealed class CampaignSchedulerService(
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<CampaignSchedulerService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalMinutes = int.Parse(configuration["Newsletter:SchedulerIntervalMinutes"] ?? "1");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessScheduledCampaignsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing scheduled campaigns");
            }

            await Task.Delay(TimeSpan.FromMinutes(intervalMinutes), stoppingToken);
        }
    }

    private async Task ProcessScheduledCampaignsAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var campaignRepository = scope.ServiceProvider.GetRequiredService<ICampaignRepository>();
        var subscriberRepository = scope.ServiceProvider.GetRequiredService<ISubscriberRepository>();
        var recipientRepository = scope.ServiceProvider.GetRequiredService<ICampaignRecipientRepository>();
        var publishEndpoint = scope.ServiceProvider.GetRequiredService<IPublishEndpoint>();

        var dueCampaigns = await campaignRepository.GetScheduledDueAsync(DateTime.UtcNow, ct);

        foreach (var campaign in dueCampaigns)
        {
            logger.LogInformation("Processing scheduled campaign {CampaignId}: {Subject}",
                campaign.Id, campaign.Subject);

            var subscribers = await subscriberRepository.GetActiveByTagAsync(campaign.TargetTag, ct);

            var recipients = subscribers.Select(s => new CampaignRecipient
            {
                Id = Guid.NewGuid(),
                CampaignId = campaign.Id,
                SubscriberId = s.Id,
                Email = s.Email,
                Status = DeliveryStatus.Queued
            }).ToList();

            await recipientRepository.AddBatchAsync(recipients, ct);

            campaign.Status = CampaignStatus.Sending;
            campaign.TotalRecipients = recipients.Count;
            await campaignRepository.UpdateAsync(campaign, ct);

            await publishEndpoint.Publish(new CampaignSendRequestedEvent(
                campaign.Id, campaign.Subject, recipients.Count, DateTime.UtcNow), ct);
        }
    }
}
