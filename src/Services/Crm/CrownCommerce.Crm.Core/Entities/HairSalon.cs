namespace CrownCommerce.Crm.Core.Entities;

public sealed class HairSalon : Contact
{
    public HairSalon()
    {
        ContactType = "HairSalon";
    }

    public required string BusinessName { get; set; }
    public string? Website { get; set; }
    public string? OwnerName { get; set; }
    public string? OwnerEmail { get; set; }
    public string? OwnerPhone { get; set; }
    public int NumberOfChairs { get; set; }
    public int NumberOfStylists { get; set; }
    public bool WholesaleAccount { get; set; }
    public DateTime? AccountCreatedDate { get; set; }
    public decimal MonthlyPurchaseVolume { get; set; }
    public ICollection<HairStylist> Stylists { get; set; } = [];
}
