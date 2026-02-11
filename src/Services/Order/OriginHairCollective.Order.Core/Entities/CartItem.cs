namespace OriginHairCollective.Order.Core.Entities;

public sealed class CartItem
{
    public Guid Id { get; set; }
    public required string SessionId { get; set; }
    public Guid? UserId { get; set; }
    public Guid ProductId { get; set; }
    public required string ProductName { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public DateTime AddedAt { get; set; }
}
