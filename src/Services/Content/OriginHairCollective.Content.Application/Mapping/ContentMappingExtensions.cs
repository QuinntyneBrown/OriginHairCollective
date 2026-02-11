using OriginHairCollective.Content.Application.Dtos;
using OriginHairCollective.Content.Core.Entities;

namespace OriginHairCollective.Content.Application.Mapping;

public static class ContentMappingExtensions
{
    public static ContentPageDto ToDto(this ContentPage page) =>
        new(page.Id, page.Slug, page.Title, page.Body, page.CreatedAt);

    public static FaqItemDto ToDto(this FaqItem faq) =>
        new(faq.Id, faq.Question, faq.Answer, faq.Category);

    public static TestimonialDto ToDto(this Testimonial testimonial) =>
        new(testimonial.Id, testimonial.CustomerName, testimonial.CustomerLocation,
            testimonial.Content, testimonial.Rating, testimonial.ImageUrl, testimonial.CreatedAt);

    public static GalleryImageDto ToDto(this GalleryImage image) =>
        new(image.Id, image.Title, image.Description, image.ImageUrl, image.Category, image.CreatedAt);
}
