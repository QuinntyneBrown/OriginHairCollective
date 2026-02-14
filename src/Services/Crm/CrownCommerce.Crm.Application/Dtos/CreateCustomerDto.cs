using CrownCommerce.Crm.Core.Enums;

namespace CrownCommerce.Crm.Application.Dtos;

public sealed class CreateCustomerDto
{
    public required string Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? Notes { get; set; }
    public Brand? Brand { get; set; }
    public string? PreferredContactMethod { get; set; }
    public bool MarketingOptIn { get; set; }
}
