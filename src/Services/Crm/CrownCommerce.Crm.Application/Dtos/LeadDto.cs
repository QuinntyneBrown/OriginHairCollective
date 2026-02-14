using CrownCommerce.Crm.Core.Enums;

namespace CrownCommerce.Crm.Application.Dtos;

public sealed class LeadDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public LeadSource Source { get; set; }
    public LeadStatus LeadStatus { get; set; }
    public int EstimatedAnnualRevenue { get; set; }
    public string? Industry { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? QualifiedDate { get; set; }
    public List<string> Tags { get; set; } = [];
}
