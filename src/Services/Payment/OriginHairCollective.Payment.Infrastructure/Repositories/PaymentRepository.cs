using OriginHairCollective.Payment.Core.Entities;
using OriginHairCollective.Payment.Core.Interfaces;
using OriginHairCollective.Payment.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace OriginHairCollective.Payment.Infrastructure.Repositories;

public sealed class PaymentRepository(PaymentDbContext context) : IPaymentRepository
{
    public async Task<PaymentRecord?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await context.Payments
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, ct);
    }

    public async Task<PaymentRecord?> GetByOrderIdAsync(Guid orderId, CancellationToken ct = default)
    {
        return await context.Payments
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.OrderId == orderId, ct);
    }

    public async Task<PaymentRecord> AddAsync(PaymentRecord payment, CancellationToken ct = default)
    {
        context.Payments.Add(payment);
        await context.SaveChangesAsync(ct);
        return payment;
    }

    public async Task UpdateAsync(PaymentRecord payment, CancellationToken ct = default)
    {
        context.Payments.Update(payment);
        await context.SaveChangesAsync(ct);
    }
}
