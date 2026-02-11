using OriginHairCollective.Newsletter.Application.Dtos;
using OriginHairCollective.Newsletter.Core.Enums;

namespace OriginHairCollective.Newsletter.Application.Services;

public interface INewsletterAdminService
{
    Task<PagedResultDto<SubscriberDto>> GetSubscribersAsync(
        int page, int pageSize, SubscriberStatus? status, string? tag, CancellationToken ct = default);
    Task<SubscriberStatsDto> GetSubscriberStatsAsync(CancellationToken ct = default);
    Task DeleteSubscriberAsync(Guid id, CancellationToken ct = default);
    Task<CampaignDetailDto> CreateCampaignAsync(CreateCampaignDto request, Guid userId, CancellationToken ct = default);
    Task<CampaignDetailDto> UpdateCampaignAsync(Guid id, UpdateCampaignDto request, CancellationToken ct = default);
    Task<PagedResultDto<CampaignDto>> GetCampaignsAsync(
        int page, int pageSize, CampaignStatus? status, CancellationToken ct = default);
    Task<CampaignDetailDto> GetCampaignAsync(Guid id, CancellationToken ct = default);
    Task<int> SendCampaignAsync(Guid id, CancellationToken ct = default);
    Task CancelCampaignAsync(Guid id, CancellationToken ct = default);
    Task<PagedResultDto<CampaignRecipientDto>> GetCampaignRecipientsAsync(
        Guid campaignId, int page, int pageSize, DeliveryStatus? status, CancellationToken ct = default);
}
