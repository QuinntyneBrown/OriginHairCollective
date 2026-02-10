namespace OriginHairCollective.Inquiry.Core.Interfaces;

public interface IInquiryRepository
{
    Task<IReadOnlyList<Entities.Inquiry>> GetAllAsync(CancellationToken ct = default);
    Task<Entities.Inquiry> AddAsync(Entities.Inquiry inquiry, CancellationToken ct = default);
}
