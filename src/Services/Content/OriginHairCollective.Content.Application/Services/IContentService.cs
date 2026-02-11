using OriginHairCollective.Content.Application.Dtos;

namespace OriginHairCollective.Content.Application.Services;

public interface IContentService
{
    Task<IReadOnlyList<ContentPageDto>> GetAllPagesAsync(CancellationToken ct = default);
    Task<ContentPageDto?> GetPageBySlugAsync(string slug, CancellationToken ct = default);
    Task<IReadOnlyList<FaqItemDto>> GetAllFaqsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<FaqItemDto>> GetFaqsByCategoryAsync(string category, CancellationToken ct = default);
    Task<IReadOnlyList<TestimonialDto>> GetTestimonialsAsync(CancellationToken ct = default);
    Task<TestimonialDto> SubmitTestimonialAsync(CreateTestimonialDto dto, CancellationToken ct = default);
    Task<IReadOnlyList<GalleryImageDto>> GetGalleryAsync(CancellationToken ct = default);
    Task<IReadOnlyList<GalleryImageDto>> GetGalleryByCategoryAsync(string category, CancellationToken ct = default);
}
