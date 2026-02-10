using OriginHairCollective.Inquiry.Application.Dtos;
using OriginHairCollective.Inquiry.Core.Interfaces;
using OriginHairCollective.Shared.Contracts;
using MassTransit;

namespace OriginHairCollective.Inquiry.Application.Services;

public sealed class InquiryService(IInquiryRepository repository, IPublishEndpoint publishEndpoint) : IInquiryService
{
    public async Task<InquiryDto> CreateAsync(CreateInquiryDto dto, CancellationToken ct = default)
    {
        var inquiry = new Core.Entities.Inquiry
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Email = dto.Email,
            Phone = dto.Phone,
            Message = dto.Message,
            ProductId = dto.ProductId,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(inquiry, ct);

        if (inquiry.ProductId.HasValue)
        {
            await publishEndpoint.Publish(new ProductInterestEvent(
                inquiry.ProductId.Value,
                $"Product {inquiry.ProductId.Value}",
                inquiry.Name,
                inquiry.Email,
                inquiry.Message,
                inquiry.CreatedAt), ct);
        }

        return ToDto(inquiry);
    }

    public async Task<IReadOnlyList<InquiryDto>> GetAllAsync(CancellationToken ct = default)
    {
        var inquiries = await repository.GetAllAsync(ct);
        return inquiries.Select(ToDto).ToList();
    }

    private static InquiryDto ToDto(Core.Entities.Inquiry inquiry) =>
        new(inquiry.Id, inquiry.Name, inquiry.Email, inquiry.Phone,
            inquiry.Message, inquiry.ProductId, inquiry.CreatedAt);
}
