using CrownCommerce.Vendor.Core.Enums;

namespace CrownCommerce.Vendor.Core.Entities;

public sealed class VendorScore
{
    public Guid Id { get; set; }
    public Guid VendorId { get; set; }
    public ChecklistSection Section { get; set; }
    public required string CriterionNumber { get; set; }
    public required string CriterionLabel { get; set; }
    public int Score { get; set; }
    public int MaxScore { get; set; }
    public string? Notes { get; set; }
    public Vendor? Vendor { get; set; }
}
