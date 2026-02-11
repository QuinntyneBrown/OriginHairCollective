using OriginHairCollective.Newsletter.Application.Dtos;
using OriginHairCollective.Newsletter.Application.Services;
using OriginHairCollective.Newsletter.Core.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace OriginHairCollective.Newsletter.Api.Controllers;

[ApiController]
[Route("admin")]
[Authorize(Roles = "Admin")]
public sealed class AdminNewsletterController(INewsletterAdminService adminService) : ControllerBase
{
    [HttpGet("subscribers")]
    public async Task<IActionResult> GetSubscribers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] SubscriberStatus? status = null,
        [FromQuery] string? tag = null,
        CancellationToken ct = default)
    {
        var result = await adminService.GetSubscribersAsync(page, pageSize, status, tag, ct);
        return Ok(result);
    }

    [HttpGet("subscribers/stats")]
    public async Task<IActionResult> GetSubscriberStats(CancellationToken ct)
    {
        var result = await adminService.GetSubscriberStatsAsync(ct);
        return Ok(result);
    }

    [HttpDelete("subscribers/{id:guid}")]
    public async Task<IActionResult> DeleteSubscriber(Guid id, CancellationToken ct)
    {
        await adminService.DeleteSubscriberAsync(id, ct);
        return NoContent();
    }

    [HttpGet("campaigns")]
    public async Task<IActionResult> GetCampaigns(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] CampaignStatus? status = null,
        CancellationToken ct = default)
    {
        var result = await adminService.GetCampaignsAsync(page, pageSize, status, ct);
        return Ok(result);
    }

    [HttpGet("campaigns/{id:guid}")]
    public async Task<IActionResult> GetCampaign(Guid id, CancellationToken ct)
    {
        try
        {
            var result = await adminService.GetCampaignAsync(id, ct);
            return Ok(result);
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }

    [HttpPost("campaigns")]
    public async Task<IActionResult> CreateCampaign([FromBody] CreateCampaignDto dto, CancellationToken ct)
    {
        // Extract user ID from JWT claims
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var userId = Guid.TryParse(userIdClaim, out var parsedId) ? parsedId : Guid.Empty;

        var result = await adminService.CreateCampaignAsync(dto, userId, ct);
        return CreatedAtAction(nameof(GetCampaign), new { id = result.Id }, result);
    }

    [HttpPut("campaigns/{id:guid}")]
    public async Task<IActionResult> UpdateCampaign(Guid id, [FromBody] UpdateCampaignDto dto, CancellationToken ct)
    {
        try
        {
            var result = await adminService.UpdateCampaignAsync(id, dto, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("campaigns/{id:guid}/send")]
    public async Task<IActionResult> SendCampaign(Guid id, CancellationToken ct)
    {
        try
        {
            var totalRecipients = await adminService.SendCampaignAsync(id, ct);
            return Accepted(new { message = "Campaign queued for delivery.", totalRecipients });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("campaigns/{id:guid}/cancel")]
    public async Task<IActionResult> CancelCampaign(Guid id, CancellationToken ct)
    {
        try
        {
            await adminService.CancelCampaignAsync(id, ct);
            return Ok(new { message = "Campaign cancelled." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("campaigns/{id:guid}/recipients")]
    public async Task<IActionResult> GetCampaignRecipients(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] DeliveryStatus? status = null,
        CancellationToken ct = default)
    {
        var result = await adminService.GetCampaignRecipientsAsync(id, page, pageSize, status, ct);
        return Ok(result);
    }
}
