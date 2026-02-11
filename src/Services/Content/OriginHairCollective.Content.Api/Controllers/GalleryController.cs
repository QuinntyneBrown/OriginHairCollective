using OriginHairCollective.Content.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace OriginHairCollective.Content.Api.Controllers;

[ApiController]
[Route("gallery")]
public sealed class GalleryController(IContentService contentService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var images = await contentService.GetGalleryAsync(ct);
        return Ok(images);
    }

    [HttpGet("category/{category}")]
    public async Task<IActionResult> GetByCategory(string category, CancellationToken ct)
    {
        var images = await contentService.GetGalleryByCategoryAsync(category, ct);
        return Ok(images);
    }
}
