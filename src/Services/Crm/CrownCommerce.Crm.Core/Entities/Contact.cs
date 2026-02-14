using CrownCommerce.Crm.Core.Enums;

namespace CrownCommerce.Crm.Core.Entities;

public abstract class Contact
{
    public Guid Id { get; set; }
    public string ContactType { get; set; } = string.Empty;
    public required string Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? Notes { get; set; }
    public ContactStatus Status { get; set; }
    public Brand? Brand { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public ICollection<Interaction> Interactions { get; set; } = [];
    public ICollection<FollowUp> FollowUps { get; set; } = [];
    public ICollection<ContactTag> Tags { get; set; } = [];
}
