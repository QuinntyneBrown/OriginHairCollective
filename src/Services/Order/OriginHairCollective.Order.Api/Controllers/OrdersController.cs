using OriginHairCollective.Order.Application.Dtos;
using OriginHairCollective.Order.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace OriginHairCollective.Order.Api.Controllers;

[ApiController]
[Route("orders")]
public sealed class OrdersController(IOrderService orderService) : ControllerBase
{
    [HttpPost("{sessionId}")]
    public async Task<IActionResult> CreateOrder(string sessionId, [FromBody] CreateOrderDto dto, CancellationToken ct)
    {
        var order = await orderService.CreateOrderFromCartAsync(sessionId, dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var order = await orderService.GetOrderByIdAsync(id, ct);
        return order is null ? NotFound() : Ok(order);
    }

    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetByUserId(Guid userId, CancellationToken ct)
    {
        var orders = await orderService.GetOrdersByUserIdAsync(userId, ct);
        return Ok(orders);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusDto dto, CancellationToken ct)
    {
        var order = await orderService.UpdateOrderStatusAsync(id, dto.Status, dto.TrackingNumber, ct);
        return order is null ? NotFound() : Ok(order);
    }
}

public sealed record UpdateOrderStatusDto(string Status, string? TrackingNumber);
