using CrownCommerce.Crm.Application.Dtos;

namespace CrownCommerce.Crm.Application.Services;

public interface ICustomerService
{
    Task<List<CustomerDto>> GetAllAsync(CancellationToken ct);
    Task<CustomerDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<CustomerDto> CreateAsync(CreateCustomerDto dto, CancellationToken ct);
    Task<CustomerDto> UpdateAsync(Guid id, CreateCustomerDto dto, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}
