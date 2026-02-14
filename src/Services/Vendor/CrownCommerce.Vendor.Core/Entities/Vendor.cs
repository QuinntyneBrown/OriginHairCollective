using CrownCommerce.Vendor.Core.Enums;

namespace CrownCommerce.Vendor.Core.Entities;

public sealed class Vendor
{
    public Guid Id { get; set; }
    public required string CompanyName { get; set; }
    public VendorPlatform Platform { get; set; }
    public required string ContactName { get; set; }
    public required string ContactEmail { get; set; }
    public string? ContactWhatsApp { get; set; }
    public string? FactoryLocation { get; set; }
    public HairOriginCountry HairOriginCountry { get; set; }
    public string? WebsiteUrl { get; set; }
    public DateTime? DateEvaluated { get; set; }
    public string? EvaluatedBy { get; set; }
    public string? Notes { get; set; }
    public VendorStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public ICollection<VendorScore> Scores { get; set; } = [];
    public ICollection<VendorRedFlag> RedFlags { get; set; } = [];
    public ICollection<VendorFollowUp> FollowUps { get; set; } = [];
}
