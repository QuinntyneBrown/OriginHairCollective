using CrownCommerce.Crm.Application.Dtos;
using CrownCommerce.Crm.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CrownCommerce.Crm.Api.Controllers;

[ApiController]
[Route("crm/customers")]
public sealed class CustomersController(ICustomerService customerService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCustomerDto dto, CancellationToken ct)
    {
        var result = await customerService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var customers = await customerService.GetAllAsync(ct);
        return Ok(customers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var customer = await customerService.GetByIdAsync(id, ct);
        if (customer == null)
            return NotFound();
        
        return Ok(customer);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateCustomerDto dto, CancellationToken ct)
    {
        try
        {
            var result = await customerService.UpdateAsync(id, dto, ct);
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
        await customerService.DeleteAsync(id, ct);
        return NoContent();
    }
}
