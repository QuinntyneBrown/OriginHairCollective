using CrownCommerce.Vendor.Application.Dtos;
using CrownCommerce.Vendor.Core.Entities;

namespace CrownCommerce.Vendor.Application.Mapping;

public static class VendorMappingExtensions
{
    public static VendorDto ToDto(this Core.Entities.Vendor vendor)
    {
        var grandTotal = vendor.Scores.Sum(s => s.Score);
        var maxTotal = vendor.Scores.Sum(s => s.MaxScore);

        return new VendorDto(
            vendor.Id,
            vendor.CompanyName,
            vendor.Platform.ToString(),
            vendor.ContactName,
            vendor.ContactEmail,
            vendor.ContactWhatsApp,
            vendor.FactoryLocation,
            vendor.HairOriginCountry.ToString(),
            vendor.WebsiteUrl,
            vendor.DateEvaluated,
            vendor.EvaluatedBy,
            vendor.Notes,
            vendor.Status.ToString(),
            grandTotal,
            maxTotal,
            GetRating(grandTotal),
            vendor.CreatedAt,
            vendor.UpdatedAt);
    }

    public static VendorDetailDto ToDetailDto(this Core.Entities.Vendor vendor)
    {
        var grandTotal = vendor.Scores.Sum(s => s.Score);
        var maxTotal = vendor.Scores.Sum(s => s.MaxScore);

        return new VendorDetailDto(
            vendor.Id,
            vendor.CompanyName,
            vendor.Platform.ToString(),
            vendor.ContactName,
            vendor.ContactEmail,
            vendor.ContactWhatsApp,
            vendor.FactoryLocation,
            vendor.HairOriginCountry.ToString(),
            vendor.WebsiteUrl,
            vendor.DateEvaluated,
            vendor.EvaluatedBy,
            vendor.Notes,
            vendor.Status.ToString(),
            grandTotal,
            maxTotal,
            GetRating(grandTotal),
            vendor.CreatedAt,
            vendor.UpdatedAt,
            vendor.Scores.Select(s => s.ToDto()).ToList(),
            vendor.RedFlags.Select(r => r.ToDto()).ToList(),
            vendor.FollowUps.Select(f => f.ToDto()).ToList());
    }

    public static VendorScoreDto ToDto(this VendorScore score) =>
        new(
            score.Id,
            score.Section.ToString(),
            score.CriterionNumber,
            score.CriterionLabel,
            score.Score,
            score.MaxScore,
            score.Notes);

    public static VendorRedFlagDto ToDto(this VendorRedFlag redFlag) =>
        new(
            redFlag.Id,
            redFlag.Description,
            redFlag.IsCleared);

    public static VendorFollowUpDto ToDto(this VendorFollowUp followUp) =>
        new(
            followUp.Id,
            followUp.VendorId,
            followUp.Subject,
            followUp.Body,
            followUp.IsSent,
            followUp.ErrorMessage,
            followUp.CreatedAt,
            followUp.SentAt);

    private static string GetRating(int grandTotal) => grandTotal switch
    {
        >= 108 => "Excellent",
        >= 85 => "Good",
        >= 62 => "Fair",
        _ => "Poor"
    };
}
