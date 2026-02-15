using CrownCommerce.Scheduling.Application.DTOs;
using CrownCommerce.Scheduling.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CrownCommerce.Scheduling.Api.Controllers;

[ApiController]
[Route("employees")]
public sealed class EmployeesController(ISchedulingService schedulingService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetEmployees([FromQuery] string? status, CancellationToken ct)
    {
        var employees = await schedulingService.GetEmployeesAsync(status, ct);
        return Ok(employees);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetEmployee(Guid id, CancellationToken ct)
    {
        var employee = await schedulingService.GetEmployeeAsync(id, ct);
        return employee is not null ? Ok(employee) : NotFound();
    }

    [HttpPost]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeDto dto, CancellationToken ct)
    {
        var employee = await schedulingService.CreateEmployeeAsync(dto, ct);
        return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateEmployee(Guid id, [FromBody] UpdateEmployeeDto dto, CancellationToken ct)
    {
        var employee = await schedulingService.UpdateEmployeeAsync(id, dto, ct);
        return Ok(employee);
    }

    [HttpPut("{id:guid}/presence")]
    public async Task<IActionResult> UpdatePresence(Guid id, [FromBody] UpdatePresenceDto dto, CancellationToken ct)
    {
        var employee = await schedulingService.UpdatePresenceAsync(id, dto, ct);
        return Ok(employee);
    }
}
