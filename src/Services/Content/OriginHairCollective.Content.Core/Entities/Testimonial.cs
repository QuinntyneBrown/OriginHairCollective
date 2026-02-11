namespace OriginHairCollective.Content.Core.Entities;

public sealed class Testimonial
{
    public Guid Id { get; set; }
    public required string CustomerName { get; set; }
    public string? CustomerLocation { get; set; }
    public required string Content { get; set; }
    public int Rating { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsApproved { get; set; }
    public DateTime CreatedAt { get; set; }
}
