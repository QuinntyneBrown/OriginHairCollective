using CrownCommerce.Crm.Core.Enums;

namespace CrownCommerce.Crm.Application.Dtos;

public sealed class CustomerDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public ContactStatus Status { get; set; }
    public CustomerTier Tier { get; set; }
    public Brand? Brand { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime? FirstPurchaseDate { get; set; }
    public DateTime? LastPurchaseDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> Tags { get; set; } = [];
}
