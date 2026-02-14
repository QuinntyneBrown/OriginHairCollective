using CrownCommerce.Crm.Core.Enums;

namespace CrownCommerce.Crm.Core.Entities;

public sealed class FollowUp
{
    public Guid Id { get; set; }
    public Guid ContactId { get; set; }
    public Contact? Contact { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public FollowUpType Type { get; set; }
    public DateTime DueDate { get; set; }
    public FollowUpStatus Status { get; set; }
    public FollowUpPriority Priority { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string? CompletionNotes { get; set; }
    public Guid AssignedToUserId { get; set; }
    public bool EmailReminderSent { get; set; }
    public Guid? RelatedInteractionId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
