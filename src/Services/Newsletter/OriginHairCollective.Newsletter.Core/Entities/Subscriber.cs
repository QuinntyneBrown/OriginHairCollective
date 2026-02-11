namespace OriginHairCollective.Newsletter.Core.Entities;

public sealed class Subscriber
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public Guid? UserId { get; set; }
    public Enums.SubscriberStatus Status { get; set; }
    public string? ConfirmationToken { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UnsubscribedAt { get; set; }
    public string? UnsubscribeToken { get; set; }
    public ICollection<SubscriberTag> Tags { get; set; } = new List<SubscriberTag>();
}
