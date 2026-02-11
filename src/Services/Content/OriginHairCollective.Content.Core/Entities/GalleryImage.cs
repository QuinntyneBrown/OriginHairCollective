namespace OriginHairCollective.Content.Core.Entities;

public sealed class GalleryImage
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string ImageUrl { get; set; }
    public required string Category { get; set; }
    public int SortOrder { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
}
