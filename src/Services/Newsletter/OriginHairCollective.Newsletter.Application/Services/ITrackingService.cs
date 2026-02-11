namespace OriginHairCollective.Newsletter.Application.Services;

public interface ITrackingService
{
    Task RecordOpenAsync(Guid campaignId, Guid subscriberId, CancellationToken ct = default);
    Task<string> RecordClickAsync(Guid campaignId, Guid subscriberId, string targetUrl, CancellationToken ct = default);
}
