namespace OriginHairCollective.Catalog.Core.Entities;

public sealed class HairOrigin
{
    public Guid Id { get; set; }
    public required string Country { get; set; }
    public required string Region { get; set; }
    public required string Description { get; set; }
    public List<HairProduct> Products { get; set; } = [];
}
