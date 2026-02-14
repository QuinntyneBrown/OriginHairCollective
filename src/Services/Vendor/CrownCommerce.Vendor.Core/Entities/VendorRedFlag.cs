namespace CrownCommerce.Vendor.Core.Entities;

public sealed class VendorRedFlag
{
    public Guid Id { get; set; }
    public Guid VendorId { get; set; }
    public required string Description { get; set; }
    public bool IsCleared { get; set; }
    public Vendor? Vendor { get; set; }
}
