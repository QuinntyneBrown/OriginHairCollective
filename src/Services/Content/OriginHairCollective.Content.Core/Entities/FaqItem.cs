namespace OriginHairCollective.Content.Core.Entities;

public sealed class FaqItem
{
    public Guid Id { get; set; }
    public required string Question { get; set; }
    public required string Answer { get; set; }
    public required string Category { get; set; }
    public int SortOrder { get; set; }
    public bool IsPublished { get; set; }
}
