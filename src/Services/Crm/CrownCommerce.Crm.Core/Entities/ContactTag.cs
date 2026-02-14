namespace CrownCommerce.Crm.Core.Entities;

public sealed class ContactTag
{
    public Guid Id { get; set; }
    public Guid ContactId { get; set; }
    public required string Tag { get; set; }
    public DateTime CreatedAt { get; set; }
}
