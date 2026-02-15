using CrownCommerce.Scheduling.Application.DTOs;
using CrownCommerce.Scheduling.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CrownCommerce.Scheduling.Api.Controllers;

[ApiController]
[Route("channels")]
public sealed class TeamChannelsController(ISchedulingService schedulingService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetChannels([FromQuery] Guid employeeId, CancellationToken ct)
    {
        var channels = await schedulingService.GetChannelsAsync(employeeId, ct);
        return Ok(channels);
    }

    [HttpGet("{id:guid}/messages")]
    public async Task<IActionResult> GetMessages(Guid id, CancellationToken ct)
    {
        var messages = await schedulingService.GetChannelMessagesAsync(id, ct);
        return Ok(messages);
    }

    [HttpPost("{id:guid}/messages")]
    public async Task<IActionResult> SendMessage(Guid id, [FromBody] SendChannelMessageDto dto, CancellationToken ct)
    {
        var message = await schedulingService.SendChannelMessageAsync(id, dto, ct);
        return Ok(message);
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, [FromBody] MarkAsReadDto dto, CancellationToken ct)
    {
        await schedulingService.MarkChannelAsReadAsync(id, dto, ct);
        return NoContent();
    }

    [HttpPost]
    public async Task<IActionResult> CreateChannel([FromBody] CreateChannelDto dto, CancellationToken ct)
    {
        var channel = await schedulingService.CreateChannelAsync(dto, ct);
        return CreatedAtAction(nameof(GetChannels), new { employeeId = dto.CreatedByEmployeeId }, channel);
    }
}
