using CrownCommerce.Crm.Core.Enums;

namespace CrownCommerce.Crm.Core.Entities;

public sealed class Lead : Contact
{
    public Lead()
    {
        ContactType = "Lead";
    }

    public required string Company { get; set; }
    public string? JobTitle { get; set; }
    public LeadSource Source { get; set; }
    public LeadStatus LeadStatus { get; set; }
    public int EstimatedAnnualRevenue { get; set; }
    public string? Industry { get; set; }
    public DateTime? QualifiedDate { get; set; }
    public DateTime? ConvertedDate { get; set; }
    public Guid? ConvertedToCustomerId { get; set; }
}
