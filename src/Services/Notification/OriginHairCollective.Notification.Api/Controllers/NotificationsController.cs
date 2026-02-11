using OriginHairCollective.Notification.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace OriginHairCollective.Notification.Api.Controllers;

[ApiController]
[Route("notifications")]
public sealed class NotificationsController(INotificationService notificationService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var logs = await notificationService.GetAllAsync(ct);
        return Ok(logs);
    }

    [HttpGet("recipient/{email}")]
    public async Task<IActionResult> GetByRecipient(string email, CancellationToken ct)
    {
        var logs = await notificationService.GetByRecipientAsync(email, ct);
        return Ok(logs);
    }
}
