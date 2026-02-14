using CrownCommerce.Vendor.Application.Dtos;
using CrownCommerce.Vendor.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CrownCommerce.Vendor.Api.Controllers;

[ApiController]
[Route("vendors")]
public sealed class VendorsController(IVendorService vendorService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var vendors = await vendorService.GetAllAsync(ct);
        return Ok(vendors);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var vendor = await vendorService.GetByIdAsync(id, ct);
        return vendor is null ? NotFound() : Ok(vendor);
    }

    [HttpGet("by-status/{status}")]
    public async Task<IActionResult> GetByStatus(string status, CancellationToken ct)
    {
        var vendors = await vendorService.GetByStatusAsync(status, ct);
        return Ok(vendors);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVendorDto dto, CancellationToken ct)
    {
        var vendor = await vendorService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = vendor.Id }, vendor);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateVendorDto dto, CancellationToken ct)
    {
        var vendor = await vendorService.UpdateAsync(id, dto, ct);
        return vendor is null ? NotFound() : Ok(vendor);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var deleted = await vendorService.DeleteAsync(id, ct);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPut("{vendorId:guid}/scores")]
    public async Task<IActionResult> SaveScores(Guid vendorId, [FromBody] SaveScoresDto dto, CancellationToken ct)
    {
        var scores = await vendorService.SaveScoresAsync(vendorId, dto, ct);
        return Ok(scores);
    }

    [HttpPut("{vendorId:guid}/red-flags")]
    public async Task<IActionResult> SaveRedFlags(Guid vendorId, [FromBody] SaveRedFlagsDto dto, CancellationToken ct)
    {
        var flags = await vendorService.SaveRedFlagsAsync(vendorId, dto, ct);
        return Ok(flags);
    }

    [HttpPost("{vendorId:guid}/follow-ups")]
    public async Task<IActionResult> SendFollowUp(Guid vendorId, [FromBody] CreateFollowUpDto dto, CancellationToken ct)
    {
        var followUp = await vendorService.SendFollowUpAsync(vendorId, dto, ct);
        return followUp is null ? NotFound() : CreatedAtAction(nameof(GetFollowUps), new { vendorId }, followUp);
    }

    [HttpGet("{vendorId:guid}/follow-ups")]
    public async Task<IActionResult> GetFollowUps(Guid vendorId, CancellationToken ct)
    {
        var followUps = await vendorService.GetFollowUpsAsync(vendorId, ct);
        return Ok(followUps);
    }
}
