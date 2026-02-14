using CrownCommerce.Crm.Core.Enums;

namespace CrownCommerce.Crm.Core.Entities;

public sealed class Interaction
{
    public Guid Id { get; set; }
    public Guid ContactId { get; set; }
    public Contact? Contact { get; set; }
    public InteractionType Type { get; set; }
    public required string Subject { get; set; }
    public required string Description { get; set; }
    public InteractionDirection Direction { get; set; }
    public DateTime InteractionDate { get; set; }
    public int DurationMinutes { get; set; }
    public string? Outcome { get; set; }
    public Guid? RelatedInquiryId { get; set; }
    public Guid? RelatedOrderId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
}
