namespace OriginHairCollective.Newsletter.Core.Entities;

public sealed class Campaign
{
    public Guid Id { get; set; }
    public required string Subject { get; set; }
    public required string HtmlBody { get; set; }
    public string? PlainTextBody { get; set; }
    public Enums.CampaignStatus Status { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public DateTime? SentAt { get; set; }
    public string? TargetTag { get; set; }
    public int TotalRecipients { get; set; }
    public int TotalSent { get; set; }
    public int TotalOpened { get; set; }
    public int TotalClicked { get; set; }
    public int TotalBounced { get; set; }
    public int TotalUnsubscribed { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
