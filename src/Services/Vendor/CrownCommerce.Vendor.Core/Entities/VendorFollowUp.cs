namespace CrownCommerce.Vendor.Core.Entities;

public sealed class VendorFollowUp
{
    public Guid Id { get; set; }
    public Guid VendorId { get; set; }
    public required string Subject { get; set; }
    public required string Body { get; set; }
    public bool IsSent { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? SentAt { get; set; }
    public Vendor? Vendor { get; set; }
}
