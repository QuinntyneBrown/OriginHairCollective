using OriginHairCollective.Catalog.Core.Enums;

namespace OriginHairCollective.Catalog.Core.Entities;

public sealed class HairProduct
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public Guid OriginId { get; set; }
    public HairTexture Texture { get; set; }
    public HairType Type { get; set; }
    public int LengthInches { get; set; }
    public decimal Price { get; set; }
    public required string Description { get; set; }
    public string? ImageUrl { get; set; }
    public HairOrigin? Origin { get; set; }
}
