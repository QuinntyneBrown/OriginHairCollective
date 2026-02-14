using CrownCommerce.Crm.Core.Enums;

namespace CrownCommerce.Crm.Application.Dtos;

public sealed class CreateLeadDto
{
    public required string Name { get; set; }
    public required string Company { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? JobTitle { get; set; }
    public LeadSource Source { get; set; }
    public int EstimatedAnnualRevenue { get; set; }
    public string? Industry { get; set; }
    public string? Notes { get; set; }
}
