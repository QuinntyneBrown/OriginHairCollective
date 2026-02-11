using OriginHairCollective.Content.Application.Dtos;
using OriginHairCollective.Content.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace OriginHairCollective.Content.Api.Controllers;

[ApiController]
[Route("testimonials")]
public sealed class TestimonialsController(IContentService contentService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var testimonials = await contentService.GetTestimonialsAsync(ct);
        return Ok(testimonials);
    }

    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] CreateTestimonialDto dto, CancellationToken ct)
    {
        var testimonial = await contentService.SubmitTestimonialAsync(dto, ct);
        return CreatedAtAction(nameof(GetAll), null, testimonial);
    }
}
