using OriginHairCollective.Content.Core.Entities;

namespace OriginHairCollective.Content.Core.Interfaces;

public interface ITestimonialRepository
{
    Task<IReadOnlyList<Testimonial>> GetApprovedAsync(CancellationToken ct = default);
    Task<Testimonial> AddAsync(Testimonial testimonial, CancellationToken ct = default);
}
