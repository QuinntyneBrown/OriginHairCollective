using OriginHairCollective.Payment.Application.Dtos;
using OriginHairCollective.Payment.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace OriginHairCollective.Payment.Api.Controllers;

[ApiController]
[Route("payments")]
public sealed class PaymentsController(IPaymentService paymentService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto dto, CancellationToken ct)
    {
        var payment = await paymentService.CreatePaymentAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = payment.Id }, payment);
    }

    [HttpPost("{id:guid}/confirm")]
    public async Task<IActionResult> ConfirmPayment(Guid id, [FromBody] ConfirmPaymentDto dto, CancellationToken ct)
    {
        var payment = await paymentService.ConfirmPaymentAsync(id, dto.ExternalTransactionId, ct);
        return payment is null ? NotFound() : Ok(payment);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var payment = await paymentService.GetByIdAsync(id, ct);
        return payment is null ? NotFound() : Ok(payment);
    }

    [HttpGet("order/{orderId:guid}")]
    public async Task<IActionResult> GetByOrderId(Guid orderId, CancellationToken ct)
    {
        var payment = await paymentService.GetByOrderIdAsync(orderId, ct);
        return payment is null ? NotFound() : Ok(payment);
    }

    [HttpPost("refunds")]
    public async Task<IActionResult> IssueRefund([FromBody] CreateRefundDto dto, CancellationToken ct)
    {
        var refund = await paymentService.IssueRefundAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = refund.PaymentId }, refund);
    }
}

public sealed record ConfirmPaymentDto(string ExternalTransactionId);
