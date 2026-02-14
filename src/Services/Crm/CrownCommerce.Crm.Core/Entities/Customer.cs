using CrownCommerce.Crm.Core.Enums;

namespace CrownCommerce.Crm.Core.Entities;

public sealed class Customer : Contact
{
    public Customer()
    {
        ContactType = "Customer";
    }

    public Guid? UserId { get; set; }
    public DateTime? FirstPurchaseDate { get; set; }
    public DateTime? LastPurchaseDate { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public CustomerTier Tier { get; set; }
    public string? PreferredContactMethod { get; set; }
    public bool MarketingOptIn { get; set; }
}
