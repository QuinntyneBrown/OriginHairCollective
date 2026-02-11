using OriginHairCollective.Order.Application.Dtos;
using OriginHairCollective.Order.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace OriginHairCollective.Order.Api.Controllers;

[ApiController]
[Route("cart")]
public sealed class CartController(ICartService cartService) : ControllerBase
{
    [HttpGet("{sessionId}")]
    public async Task<IActionResult> GetCart(string sessionId, CancellationToken ct)
    {
        var items = await cartService.GetCartAsync(sessionId, ct);
        return Ok(items);
    }

    [HttpPost("{sessionId}")]
    public async Task<IActionResult> AddToCart(string sessionId, [FromBody] AddToCartDto dto, CancellationToken ct)
    {
        var item = await cartService.AddToCartAsync(sessionId, dto, ct);
        return CreatedAtAction(nameof(GetCart), new { sessionId }, item);
    }

    [HttpDelete("items/{itemId:guid}")]
    public async Task<IActionResult> RemoveFromCart(Guid itemId, CancellationToken ct)
    {
        await cartService.RemoveFromCartAsync(itemId, ct);
        return NoContent();
    }

    [HttpDelete("{sessionId}")]
    public async Task<IActionResult> ClearCart(string sessionId, CancellationToken ct)
    {
        await cartService.ClearCartAsync(sessionId, ct);
        return NoContent();
    }
}
