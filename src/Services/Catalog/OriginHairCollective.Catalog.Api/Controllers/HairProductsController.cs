using OriginHairCollective.Catalog.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace OriginHairCollective.Catalog.Api.Controllers;

[ApiController]
[Route("products")]
public sealed class HairProductsController(ICatalogService catalogService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var products = await catalogService.GetAllProductsAsync(ct);
        return Ok(products);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var product = await catalogService.GetProductByIdAsync(id, ct);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpGet("by-origin/{originId:guid}")]
    public async Task<IActionResult> GetByOrigin(Guid originId, CancellationToken ct)
    {
        var products = await catalogService.GetProductsByOriginAsync(originId, ct);
        return Ok(products);
    }
}
