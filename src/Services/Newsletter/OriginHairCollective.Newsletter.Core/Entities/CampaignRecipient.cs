namespace OriginHairCollective.Newsletter.Core.Entities;

public sealed class CampaignRecipient
{
    public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public Guid SubscriberId { get; set; }
    public required string Email { get; set; }
    public Enums.DeliveryStatus Status { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? OpenedAt { get; set; }
    public DateTime? ClickedAt { get; set; }
    public string? ErrorMessage { get; set; }
}
