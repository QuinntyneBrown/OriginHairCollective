using OriginHairCollective.Inquiry.Application.Dtos;

namespace OriginHairCollective.Inquiry.Application.Services;

public interface IInquiryService
{
    Task<InquiryDto> CreateAsync(CreateInquiryDto dto, CancellationToken ct = default);
    Task<IReadOnlyList<InquiryDto>> GetAllAsync(CancellationToken ct = default);
}
