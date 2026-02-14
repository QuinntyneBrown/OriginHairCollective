using CrownCommerce.Crm.Application.Dtos;
using CrownCommerce.Crm.Core.Entities;
using CrownCommerce.Crm.Core.Enums;
using CrownCommerce.Crm.Core.Interfaces;

namespace CrownCommerce.Crm.Application.Services;

public sealed class LeadService : ILeadService
{
    private readonly IContactRepository _repository;

    public LeadService(IContactRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<LeadDto>> GetAllAsync(CancellationToken ct)
    {
        var contacts = await _repository.GetAllAsync(ct);
        var leads = contacts.OfType<Lead>().ToList();
        
        return leads.Select(MapToDto).ToList();
    }

    public async Task<LeadDto?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var contact = await _repository.GetByIdAsync(id, ct);
        if (contact is not Lead lead)
            return null;

        return MapToDto(lead);
    }

    public async Task<LeadDto> CreateAsync(CreateLeadDto dto, CancellationToken ct)
    {
        var lead = new Lead
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Company = dto.Company,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            JobTitle = dto.JobTitle,
            Source = dto.Source,
            EstimatedAnnualRevenue = dto.EstimatedAnnualRevenue,
            Industry = dto.Industry,
            Notes = dto.Notes,
            Status = ContactStatus.Active,
            LeadStatus = LeadStatus.New
        };

        await _repository.AddAsync(lead, ct);
        return MapToDto(lead);
    }

    public async Task<LeadDto> UpdateAsync(Guid id, CreateLeadDto dto, CancellationToken ct)
    {
        var contact = await _repository.GetByIdAsync(id, ct);
        if (contact is not Lead lead)
            throw new InvalidOperationException("Lead not found");

        lead.Name = dto.Name;
        lead.Company = dto.Company;
        lead.Email = dto.Email;
        lead.Phone = dto.Phone;
        lead.Address = dto.Address;
        lead.JobTitle = dto.JobTitle;
        lead.Source = dto.Source;
        lead.EstimatedAnnualRevenue = dto.EstimatedAnnualRevenue;
        lead.Industry = dto.Industry;
        lead.Notes = dto.Notes;

        await _repository.UpdateAsync(lead, ct);
        return MapToDto(lead);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        await _repository.DeleteAsync(id, ct);
    }

    private static LeadDto MapToDto(Lead lead)
    {
        return new LeadDto
        {
            Id = lead.Id,
            Name = lead.Name,
            Company = lead.Company,
            Email = lead.Email,
            Phone = lead.Phone,
            Source = lead.Source,
            LeadStatus = lead.LeadStatus,
            EstimatedAnnualRevenue = lead.EstimatedAnnualRevenue,
            Industry = lead.Industry,
            CreatedAt = lead.CreatedAt,
            QualifiedDate = lead.QualifiedDate,
            Tags = lead.Tags.Select(t => t.Tag).ToList()
        };
    }
}
