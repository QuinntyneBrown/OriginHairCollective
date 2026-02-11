using OriginHairCollective.Newsletter.Application.Dtos;
using OriginHairCollective.Newsletter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace OriginHairCollective.Newsletter.Api.Controllers;

[ApiController]
[Route("subscribe")]
public sealed class SubscriptionController(INewsletterSubscriptionService subscriptionService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeRequestDto dto, CancellationToken ct)
    {
        var result = await subscriptionService.SubscribeAsync(dto, ct);

        if (result.Message == "You are already subscribed.")
            return Ok(result);

        return Accepted(result);
    }

    [HttpGet("/confirm")]
    public async Task<IActionResult> Confirm([FromQuery] string token, CancellationToken ct)
    {
        try
        {
            await subscriptionService.ConfirmAsync(token, ct);
            return Ok(new { message = "Your subscription has been confirmed." });
        }
        catch (InvalidOperationException)
        {
            return NotFound(new { message = "Invalid or expired confirmation token." });
        }
    }

    [HttpGet("/unsubscribe")]
    public async Task<IActionResult> Unsubscribe([FromQuery] string token, CancellationToken ct)
    {
        try
        {
            await subscriptionService.UnsubscribeAsync(token, ct);
            return Ok(new { message = "You have been unsubscribed." });
        }
        catch (InvalidOperationException)
        {
            return NotFound(new { message = "Invalid unsubscribe token." });
        }
    }
}
