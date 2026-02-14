using CrownCommerce.Crm.Application.Dtos;
using CrownCommerce.Crm.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CrownCommerce.Crm.Api.Controllers;

[ApiController]
[Route("crm/leads")]
public sealed class LeadsController(ILeadService leadService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLeadDto dto, CancellationToken ct)
    {
        var result = await leadService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var leads = await leadService.GetAllAsync(ct);
        return Ok(leads);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var lead = await leadService.GetByIdAsync(id, ct);
        if (lead == null)
            return NotFound();
        
        return Ok(lead);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateLeadDto dto, CancellationToken ct)
    {
        try
        {
            var result = await leadService.UpdateAsync(id, dto, ct);
            return Ok(result);
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await leadService.DeleteAsync(id, ct);
        return NoContent();
    }
}
