namespace OriginHairCollective.Newsletter.Application.Dtos;

public sealed record SubscriberStatsDto(
    int TotalActive,
    int TotalPending,
    int TotalUnsubscribed,
    int RecentSubscribers);
