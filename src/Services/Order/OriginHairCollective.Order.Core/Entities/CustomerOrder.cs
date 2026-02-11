using OriginHairCollective.Order.Core.Enums;

namespace OriginHairCollective.Order.Core.Entities;

public sealed class CustomerOrder
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public required string CustomerEmail { get; set; }
    public required string CustomerName { get; set; }
    public required string ShippingAddress { get; set; }
    public string? TrackingNumber { get; set; }
    public OrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<OrderItem> Items { get; set; } = [];
}
