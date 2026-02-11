namespace OriginHairCollective.Payment.Core.Entities;

public sealed class RefundRecord
{
    public Guid Id { get; set; }
    public Guid PaymentId { get; set; }
    public Guid OrderId { get; set; }
    public required string CustomerEmail { get; set; }
    public decimal Amount { get; set; }
    public required string Reason { get; set; }
    public DateTime CreatedAt { get; set; }
    public PaymentRecord? Payment { get; set; }
}
