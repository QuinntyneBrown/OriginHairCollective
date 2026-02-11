using OriginHairCollective.Content.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace OriginHairCollective.Content.Api.Controllers;

[ApiController]
[Route("pages")]
public sealed class PagesController(IContentService contentService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var pages = await contentService.GetAllPagesAsync(ct);
        return Ok(pages);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        var page = await contentService.GetPageBySlugAsync(slug, ct);
        return page is null ? NotFound() : Ok(page);
    }
}
