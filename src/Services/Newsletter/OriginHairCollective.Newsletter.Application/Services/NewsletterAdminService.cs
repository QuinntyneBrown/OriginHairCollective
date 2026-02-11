using OriginHairCollective.Newsletter.Application.Dtos;
using OriginHairCollective.Newsletter.Application.Mapping;
using OriginHairCollective.Newsletter.Core.Entities;
using OriginHairCollective.Newsletter.Core.Enums;
using OriginHairCollective.Newsletter.Core.Interfaces;
using OriginHairCollective.Shared.Contracts;
using MassTransit;

namespace OriginHairCollective.Newsletter.Application.Services;

public sealed class NewsletterAdminService(
    ISubscriberRepository subscriberRepository,
    ICampaignRepository campaignRepository,
    ICampaignRecipientRepository campaignRecipientRepository,
    IPublishEndpoint publishEndpoint) : INewsletterAdminService
{
    public async Task<PagedResultDto<SubscriberDto>> GetSubscribersAsync(
        int page, int pageSize, SubscriberStatus? status, string? tag, CancellationToken ct = default)
    {
        var (items, totalCount) = await subscriberRepository.GetPagedAsync(page, pageSize, status, tag, ct);
        return new PagedResultDto<SubscriberDto>(
            items.Select(s => s.ToDto()).ToList(),
            totalCount, page, pageSize);
    }

    public async Task<SubscriberStatsDto> GetSubscriberStatsAsync(CancellationToken ct = default)
    {
        var (totalActive, totalPending, totalUnsubscribed, recentSubscribers) =
            await subscriberRepository.GetStatsAsync(ct);
        return new SubscriberStatsDto(totalActive, totalPending, totalUnsubscribed, recentSubscribers);
    }

    public async Task DeleteSubscriberAsync(Guid id, CancellationToken ct = default)
    {
        await subscriberRepository.DeleteAsync(id, ct);
    }

    public async Task<CampaignDetailDto> CreateCampaignAsync(CreateCampaignDto request, Guid userId, CancellationToken ct = default)
    {
        var campaign = new Campaign
        {
            Id = Guid.NewGuid(),
            Subject = request.Subject,
            HtmlBody = request.HtmlBody,
            PlainTextBody = request.PlainTextBody,
            Status = request.ScheduledAt.HasValue ? CampaignStatus.Scheduled : CampaignStatus.Draft,
            ScheduledAt = request.ScheduledAt,
            TargetTag = request.TargetTag,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        await campaignRepository.AddAsync(campaign, ct);
        return campaign.ToDetailDto();
    }

    public async Task<CampaignDetailDto> UpdateCampaignAsync(Guid id, UpdateCampaignDto request, CancellationToken ct = default)
    {
        var campaign = await campaignRepository.GetByIdAsync(id, ct)
            ?? throw new InvalidOperationException("Campaign not found.");

        if (campaign.Status is not (CampaignStatus.Draft or CampaignStatus.Scheduled))
            throw new InvalidOperationException("Only draft or scheduled campaigns can be updated.");

        if (request.Subject is not null) campaign.Subject = request.Subject;
        if (request.HtmlBody is not null) campaign.HtmlBody = request.HtmlBody;
        if (request.PlainTextBody is not null) campaign.PlainTextBody = request.PlainTextBody;
        if (request.TargetTag is not null) campaign.TargetTag = request.TargetTag;
        if (request.ScheduledAt.HasValue)
        {
            campaign.ScheduledAt = request.ScheduledAt;
            campaign.Status = CampaignStatus.Scheduled;
        }

        campaign.UpdatedAt = DateTime.UtcNow;
        await campaignRepository.UpdateAsync(campaign, ct);
        return campaign.ToDetailDto();
    }

    public async Task<PagedResultDto<CampaignDto>> GetCampaignsAsync(
        int page, int pageSize, CampaignStatus? status, CancellationToken ct = default)
    {
        var (items, totalCount) = await campaignRepository.GetPagedAsync(page, pageSize, status, ct);
        return new PagedResultDto<CampaignDto>(
            items.Select(c => c.ToDto()).ToList(),
            totalCount, page, pageSize);
    }

    public async Task<CampaignDetailDto> GetCampaignAsync(Guid id, CancellationToken ct = default)
    {
        var campaign = await campaignRepository.GetByIdAsync(id, ct)
            ?? throw new InvalidOperationException("Campaign not found.");
        return campaign.ToDetailDto();
    }

    public async Task<int> SendCampaignAsync(Guid id, CancellationToken ct = default)
    {
        var campaign = await campaignRepository.GetByIdAsync(id, ct)
            ?? throw new InvalidOperationException("Campaign not found.");

        if (campaign.Status is not (CampaignStatus.Draft or CampaignStatus.Scheduled))
            throw new InvalidOperationException("Only draft or scheduled campaigns can be sent.");

        var subscribers = await subscriberRepository.GetActiveByTagAsync(campaign.TargetTag, ct);

        var recipients = subscribers.Select(s => new CampaignRecipient
        {
            Id = Guid.NewGuid(),
            CampaignId = campaign.Id,
            SubscriberId = s.Id,
            Email = s.Email,
            Status = DeliveryStatus.Queued
        }).ToList();

        await campaignRecipientRepository.AddBatchAsync(recipients, ct);

        campaign.Status = CampaignStatus.Sending;
        campaign.TotalRecipients = recipients.Count;
        await campaignRepository.UpdateAsync(campaign, ct);

        await publishEndpoint.Publish(new CampaignSendRequestedEvent(
            campaign.Id, campaign.Subject, recipients.Count, DateTime.UtcNow), ct);

        return recipients.Count;
    }

    public async Task CancelCampaignAsync(Guid id, CancellationToken ct = default)
    {
        var campaign = await campaignRepository.GetByIdAsync(id, ct)
            ?? throw new InvalidOperationException("Campaign not found.");

        if (campaign.Status is not (CampaignStatus.Sending or CampaignStatus.Scheduled))
            throw new InvalidOperationException("Only sending or scheduled campaigns can be cancelled.");

        campaign.Status = CampaignStatus.Cancelled;
        campaign.UpdatedAt = DateTime.UtcNow;
        await campaignRepository.UpdateAsync(campaign, ct);
    }

    public async Task<PagedResultDto<CampaignRecipientDto>> GetCampaignRecipientsAsync(
        Guid campaignId, int page, int pageSize, DeliveryStatus? status, CancellationToken ct = default)
    {
        var (items, totalCount) = await campaignRecipientRepository.GetPagedByCampaignAsync(
            campaignId, page, pageSize, status, ct);
        return new PagedResultDto<CampaignRecipientDto>(
            items.Select(r => r.ToDto()).ToList(),
            totalCount, page, pageSize);
    }
}
