namespace OriginHairCollective.Newsletter.Core.Entities;

public sealed class SubscriberTag
{
    public Guid Id { get; set; }
    public Guid SubscriberId { get; set; }
    public required string Tag { get; set; }
    public DateTime CreatedAt { get; set; }
}
