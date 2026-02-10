using OriginHairCollective.Catalog.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace OriginHairCollective.Catalog.Api.Controllers;

[ApiController]
[Route("origins")]
public sealed class HairOriginsController(ICatalogService catalogService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var origins = await catalogService.GetAllOriginsAsync(ct);
        return Ok(origins);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var origin = await catalogService.GetOriginByIdAsync(id, ct);
        return origin is null ? NotFound() : Ok(origin);
    }
}
