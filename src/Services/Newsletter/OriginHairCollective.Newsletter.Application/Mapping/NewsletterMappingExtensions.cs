using OriginHairCollective.Newsletter.Application.Dtos;
using OriginHairCollective.Newsletter.Core.Entities;

namespace OriginHairCollective.Newsletter.Application.Mapping;

public static class NewsletterMappingExtensions
{
    public static SubscriberDto ToDto(this Subscriber subscriber) =>
        new(subscriber.Id,
            subscriber.Email,
            subscriber.FirstName,
            subscriber.LastName,
            subscriber.Status.ToString(),
            subscriber.Tags.Select(t => t.Tag).ToList(),
            subscriber.ConfirmedAt,
            subscriber.CreatedAt,
            subscriber.UnsubscribedAt);

    public static CampaignDto ToDto(this Campaign campaign) =>
        new(campaign.Id,
            campaign.Subject,
            campaign.Status.ToString(),
            campaign.TargetTag,
            campaign.TotalRecipients,
            campaign.TotalSent,
            campaign.TotalOpened,
            campaign.TotalClicked,
            campaign.TotalBounced,
            campaign.TotalUnsubscribed,
            campaign.ScheduledAt,
            campaign.SentAt,
            campaign.CreatedAt);

    public static CampaignDetailDto ToDetailDto(this Campaign campaign) =>
        new(campaign.Id,
            campaign.Subject,
            campaign.HtmlBody,
            campaign.PlainTextBody,
            campaign.Status.ToString(),
            campaign.TargetTag,
            campaign.TotalRecipients,
            campaign.TotalSent,
            campaign.TotalOpened,
            campaign.TotalClicked,
            campaign.TotalBounced,
            campaign.TotalUnsubscribed,
            campaign.ScheduledAt,
            campaign.SentAt,
            campaign.CreatedByUserId,
            campaign.CreatedAt,
            campaign.UpdatedAt);

    public static CampaignRecipientDto ToDto(this CampaignRecipient recipient) =>
        new(recipient.Id,
            recipient.Email,
            recipient.Status.ToString(),
            recipient.SentAt,
            recipient.OpenedAt,
            recipient.ClickedAt,
            recipient.ErrorMessage);
}
