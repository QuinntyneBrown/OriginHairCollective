using CrownCommerce.Crm.Application.Dtos;
using CrownCommerce.Crm.Core.Entities;
using CrownCommerce.Crm.Core.Enums;
using CrownCommerce.Crm.Core.Interfaces;

namespace CrownCommerce.Crm.Application.Services;

public sealed class CustomerService : ICustomerService
{
    private readonly IContactRepository _repository;

    public CustomerService(IContactRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<CustomerDto>> GetAllAsync(CancellationToken ct)
    {
        var contacts = await _repository.GetAllAsync(ct);
        var customers = contacts.OfType<Customer>().ToList();
        
        return customers.Select(MapToDto).ToList();
    }

    public async Task<CustomerDto?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var contact = await _repository.GetByIdAsync(id, ct);
        if (contact is not Customer customer)
            return null;

        return MapToDto(customer);
    }

    public async Task<CustomerDto> CreateAsync(CreateCustomerDto dto, CancellationToken ct)
    {
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            City = dto.City,
            State = dto.State,
            ZipCode = dto.ZipCode,
            Country = dto.Country,
            Notes = dto.Notes,
            Brand = dto.Brand,
            PreferredContactMethod = dto.PreferredContactMethod,
            MarketingOptIn = dto.MarketingOptIn,
            Status = ContactStatus.Active,
            Tier = CustomerTier.Standard
        };

        await _repository.AddAsync(customer, ct);
        return MapToDto(customer);
    }

    public async Task<CustomerDto> UpdateAsync(Guid id, CreateCustomerDto dto, CancellationToken ct)
    {
        var contact = await _repository.GetByIdAsync(id, ct);
        if (contact is not Customer customer)
            throw new InvalidOperationException("Customer not found");

        customer.Name = dto.Name;
        customer.Email = dto.Email;
        customer.Phone = dto.Phone;
        customer.Address = dto.Address;
        customer.City = dto.City;
        customer.State = dto.State;
        customer.ZipCode = dto.ZipCode;
        customer.Country = dto.Country;
        customer.Notes = dto.Notes;
        customer.Brand = dto.Brand;
        customer.PreferredContactMethod = dto.PreferredContactMethod;
        customer.MarketingOptIn = dto.MarketingOptIn;

        await _repository.UpdateAsync(customer, ct);
        return MapToDto(customer);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        await _repository.DeleteAsync(id, ct);
    }

    private static CustomerDto MapToDto(Customer customer)
    {
        return new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Email = customer.Email,
            Phone = customer.Phone,
            Status = customer.Status,
            Tier = customer.Tier,
            Brand = customer.Brand,
            TotalOrders = customer.TotalOrders,
            TotalSpent = customer.TotalSpent,
            FirstPurchaseDate = customer.FirstPurchaseDate,
            LastPurchaseDate = customer.LastPurchaseDate,
            CreatedAt = customer.CreatedAt,
            Tags = customer.Tags.Select(t => t.Tag).ToList()
        };
    }
}
