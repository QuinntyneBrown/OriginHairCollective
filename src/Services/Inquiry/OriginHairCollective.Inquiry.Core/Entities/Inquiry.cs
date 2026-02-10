namespace OriginHairCollective.Inquiry.Core.Entities;

public sealed class Inquiry
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? Phone { get; set; }
    public required string Message { get; set; }
    public Guid? ProductId { get; set; }
    public DateTime CreatedAt { get; set; }
}
