using CrownCommerce.Crm.Application.Dtos;

namespace CrownCommerce.Crm.Application.Services;

public interface ILeadService
{
    Task<List<LeadDto>> GetAllAsync(CancellationToken ct);
    Task<LeadDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<LeadDto> CreateAsync(CreateLeadDto dto, CancellationToken ct);
    Task<LeadDto> UpdateAsync(Guid id, CreateLeadDto dto, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}
