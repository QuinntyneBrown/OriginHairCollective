using OriginHairCollective.Content.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace OriginHairCollective.Content.Api.Controllers;

[ApiController]
[Route("faqs")]
public sealed class FaqsController(IContentService contentService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var faqs = await contentService.GetAllFaqsAsync(ct);
        return Ok(faqs);
    }

    [HttpGet("category/{category}")]
    public async Task<IActionResult> GetByCategory(string category, CancellationToken ct)
    {
        var faqs = await contentService.GetFaqsByCategoryAsync(category, ct);
        return Ok(faqs);
    }
}
