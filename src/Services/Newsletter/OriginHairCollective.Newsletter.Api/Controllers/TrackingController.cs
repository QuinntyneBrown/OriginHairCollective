using OriginHairCollective.Newsletter.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace OriginHairCollective.Newsletter.Api.Controllers;

[ApiController]
[Route("track")]
public sealed class TrackingController(ITrackingService trackingService) : ControllerBase
{
    // 1x1 transparent GIF
    private static readonly byte[] TransparentGif =
    [
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
        0x01, 0x00, 0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
        0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00,
        0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
        0x01, 0x00, 0x3B
    ];

    [HttpGet("open")]
    public async Task<IActionResult> TrackOpen(
        [FromQuery] Guid cid, [FromQuery] Guid sid, CancellationToken ct)
    {
        await trackingService.RecordOpenAsync(cid, sid, ct);
        return File(TransparentGif, "image/gif");
    }

    [HttpGet("click")]
    public async Task<IActionResult> TrackClick(
        [FromQuery] Guid cid, [FromQuery] Guid sid, [FromQuery] string url, CancellationToken ct)
    {
        var targetUrl = await trackingService.RecordClickAsync(cid, sid, url, ct);
        return Redirect(targetUrl);
    }
}
