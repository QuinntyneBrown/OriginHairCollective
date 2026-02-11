using OriginHairCollective.Content.Application.Dtos;
using OriginHairCollective.Content.Application.Mapping;
using OriginHairCollective.Content.Core.Entities;
using OriginHairCollective.Content.Core.Interfaces;

namespace OriginHairCollective.Content.Application.Services;

public sealed class ContentService(
    IContentPageRepository pageRepository,
    IFaqRepository faqRepository,
    ITestimonialRepository testimonialRepository,
    IGalleryRepository galleryRepository) : IContentService
{
    public async Task<IReadOnlyList<ContentPageDto>> GetAllPagesAsync(CancellationToken ct = default)
    {
        var pages = await pageRepository.GetAllPublishedAsync(ct);
        return pages.Select(p => p.ToDto()).ToList();
    }

    public async Task<ContentPageDto?> GetPageBySlugAsync(string slug, CancellationToken ct = default)
    {
        var page = await pageRepository.GetBySlugAsync(slug, ct);
        return page?.ToDto();
    }

    public async Task<IReadOnlyList<FaqItemDto>> GetAllFaqsAsync(CancellationToken ct = default)
    {
        var faqs = await faqRepository.GetAllPublishedAsync(ct);
        return faqs.Select(f => f.ToDto()).ToList();
    }

    public async Task<IReadOnlyList<FaqItemDto>> GetFaqsByCategoryAsync(string category, CancellationToken ct = default)
    {
        var faqs = await faqRepository.GetByCategoryAsync(category, ct);
        return faqs.Select(f => f.ToDto()).ToList();
    }

    public async Task<IReadOnlyList<TestimonialDto>> GetTestimonialsAsync(CancellationToken ct = default)
    {
        var testimonials = await testimonialRepository.GetApprovedAsync(ct);
        return testimonials.Select(t => t.ToDto()).ToList();
    }

    public async Task<TestimonialDto> SubmitTestimonialAsync(CreateTestimonialDto dto, CancellationToken ct = default)
    {
        var testimonial = new Testimonial
        {
            Id = Guid.NewGuid(),
            CustomerName = dto.CustomerName,
            CustomerLocation = dto.CustomerLocation,
            Content = dto.Content,
            Rating = dto.Rating,
            ImageUrl = dto.ImageUrl,
            IsApproved = false,
            CreatedAt = DateTime.UtcNow
        };

        await testimonialRepository.AddAsync(testimonial, ct);
        return testimonial.ToDto();
    }

    public async Task<IReadOnlyList<GalleryImageDto>> GetGalleryAsync(CancellationToken ct = default)
    {
        var images = await galleryRepository.GetAllPublishedAsync(ct);
        return images.Select(i => i.ToDto()).ToList();
    }

    public async Task<IReadOnlyList<GalleryImageDto>> GetGalleryByCategoryAsync(string category, CancellationToken ct = default)
    {
        var images = await galleryRepository.GetByCategoryAsync(category, ct);
        return images.Select(i => i.ToDto()).ToList();
    }
}
