using CrownCommerce.Shared.Contracts;
using CrownCommerce.Vendor.Application.Dtos;
using CrownCommerce.Vendor.Application.Mapping;
using CrownCommerce.Vendor.Core.Entities;
using CrownCommerce.Vendor.Core.Enums;
using CrownCommerce.Vendor.Core.Interfaces;
using MassTransit;

namespace CrownCommerce.Vendor.Application.Services;

public sealed class VendorService(IVendorRepository repository, IPublishEndpoint publishEndpoint) : IVendorService
{
    public async Task<IReadOnlyList<VendorDto>> GetAllAsync(CancellationToken ct = default)
    {
        var vendors = await repository.GetAllAsync(ct);
        return vendors.Select(v => v.ToDto()).ToList();
    }

    public async Task<VendorDetailDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var vendor = await repository.GetByIdAsync(id, ct);
        return vendor?.ToDetailDto();
    }

    public async Task<IReadOnlyList<VendorDto>> GetByStatusAsync(string status, CancellationToken ct = default)
    {
        if (!Enum.TryParse<VendorStatus>(status, true, out var vendorStatus))
            return [];

        var vendors = await repository.GetByStatusAsync(vendorStatus, ct);
        return vendors.Select(v => v.ToDto()).ToList();
    }

    public async Task<VendorDto> CreateAsync(CreateVendorDto dto, CancellationToken ct = default)
    {
        var vendor = new Core.Entities.Vendor
        {
            Id = Guid.NewGuid(),
            CompanyName = dto.CompanyName,
            Platform = Enum.TryParse<VendorPlatform>(dto.Platform, true, out var platform) ? platform : VendorPlatform.Other,
            ContactName = dto.ContactName,
            ContactEmail = dto.ContactEmail,
            ContactWhatsApp = dto.ContactWhatsApp,
            FactoryLocation = dto.FactoryLocation,
            HairOriginCountry = Enum.TryParse<HairOriginCountry>(dto.HairOriginCountry, true, out var country) ? country : HairOriginCountry.Other,
            WebsiteUrl = dto.WebsiteUrl,
            EvaluatedBy = dto.EvaluatedBy,
            Notes = dto.Notes,
            Status = VendorStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        var created = await repository.AddAsync(vendor, ct);

        // Seed default red flags from the checklist
        var defaultRedFlags = GetDefaultRedFlags(created.Id);
        await repository.AddRedFlagsAsync(defaultRedFlags, ct);

        created.RedFlags = defaultRedFlags.ToList();
        return created.ToDto();
    }

    public async Task<VendorDto?> UpdateAsync(Guid id, UpdateVendorDto dto, CancellationToken ct = default)
    {
        var vendor = await repository.GetByIdAsync(id, ct);
        if (vendor is null) return null;

        vendor.CompanyName = dto.CompanyName;
        vendor.Platform = Enum.TryParse<VendorPlatform>(dto.Platform, true, out var platform) ? platform : VendorPlatform.Other;
        vendor.ContactName = dto.ContactName;
        vendor.ContactEmail = dto.ContactEmail;
        vendor.ContactWhatsApp = dto.ContactWhatsApp;
        vendor.FactoryLocation = dto.FactoryLocation;
        vendor.HairOriginCountry = Enum.TryParse<HairOriginCountry>(dto.HairOriginCountry, true, out var country) ? country : HairOriginCountry.Other;
        vendor.WebsiteUrl = dto.WebsiteUrl;
        vendor.EvaluatedBy = dto.EvaluatedBy;
        vendor.Notes = dto.Notes;
        vendor.Status = Enum.TryParse<VendorStatus>(dto.Status, true, out var status) ? status : vendor.Status;
        vendor.UpdatedAt = DateTime.UtcNow;

        if (vendor.Status == VendorStatus.Evaluating && vendor.DateEvaluated is null)
        {
            vendor.DateEvaluated = DateTime.UtcNow;
        }

        await repository.UpdateAsync(vendor, ct);
        return vendor.ToDto();
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var vendor = await repository.GetByIdAsync(id, ct);
        if (vendor is null) return false;

        await repository.DeleteAsync(id, ct);
        return true;
    }

    public async Task<IReadOnlyList<VendorScoreDto>> SaveScoresAsync(Guid vendorId, SaveScoresDto dto, CancellationToken ct = default)
    {
        var vendor = await repository.GetByIdAsync(vendorId, ct);
        if (vendor is null) return [];

        // Remove existing scores and replace
        var existingScores = vendor.Scores.ToList();
        if (existingScores.Count > 0)
        {
            // Clear existing scores by removing via context
            foreach (var existing in existingScores)
            {
                existing.Score = 0;
            }
        }

        var newScores = dto.Scores.Select(s => new VendorScore
        {
            Id = Guid.NewGuid(),
            VendorId = vendorId,
            Section = Enum.TryParse<ChecklistSection>(s.Section, true, out var section) ? section : ChecklistSection.ValueAndPricing,
            CriterionNumber = s.CriterionNumber,
            CriterionLabel = s.CriterionLabel,
            Score = s.Score,
            MaxScore = s.MaxScore,
            Notes = s.Notes
        }).ToList();

        await repository.AddScoresAsync(newScores, ct);
        return newScores.Select(s => s.ToDto()).ToList();
    }

    public async Task<IReadOnlyList<VendorRedFlagDto>> SaveRedFlagsAsync(Guid vendorId, SaveRedFlagsDto dto, CancellationToken ct = default)
    {
        var vendor = await repository.GetByIdAsync(vendorId, ct);
        if (vendor is null) return [];

        var existingFlags = vendor.RedFlags.ToList();

        // Update existing flags to match the provided data
        foreach (var flag in existingFlags)
        {
            var match = dto.RedFlags.FirstOrDefault(r => r.Description == flag.Description);
            if (match is not null)
            {
                flag.IsCleared = match.IsCleared;
            }
        }

        await repository.UpdateRedFlagsAsync(existingFlags, ct);
        return existingFlags.Select(r => r.ToDto()).ToList();
    }

    public async Task<VendorFollowUpDto?> SendFollowUpAsync(Guid vendorId, CreateFollowUpDto dto, CancellationToken ct = default)
    {
        var vendor = await repository.GetByIdAsync(vendorId, ct);
        if (vendor is null) return null;

        var followUp = new VendorFollowUp
        {
            Id = Guid.NewGuid(),
            VendorId = vendorId,
            Subject = dto.Subject,
            Body = dto.Body,
            IsSent = false,
            CreatedAt = DateTime.UtcNow
        };

        var created = await repository.AddFollowUpAsync(followUp, ct);

        // Publish event for the notification service to handle email sending
        await publishEndpoint.Publish(new VendorFollowUpRequestedEvent(
            created.Id,
            vendorId,
            vendor.CompanyName,
            vendor.ContactEmail,
            vendor.ContactName,
            dto.Subject,
            dto.Body,
            DateTime.UtcNow), ct);

        return created.ToDto();
    }

    public async Task<IReadOnlyList<VendorFollowUpDto>> GetFollowUpsAsync(Guid vendorId, CancellationToken ct = default)
    {
        var followUps = await repository.GetFollowUpsByVendorIdAsync(vendorId, ct);
        return followUps.Select(f => f.ToDto()).ToList();
    }

    private static List<VendorRedFlag> GetDefaultRedFlags(Guid vendorId) =>
    [
        new() { Id = Guid.NewGuid(), VendorId = vendorId, Description = "Vendor does not insist on Western Union or MoneyGram as the only payment method", IsCleared = false },
        new() { Id = Guid.NewGuid(), VendorId = vendorId, Description = "Vendor does not pressure you to pay 100% upfront before any samples", IsCleared = false },
        new() { Id = Guid.NewGuid(), VendorId = vendorId, Description = "Vendor does not refuse to send samples under any circumstances", IsCleared = false },
        new() { Id = Guid.NewGuid(), VendorId = vendorId, Description = "Vendor's factory photos are not stolen from other listings (reverse image search)", IsCleared = false },
        new() { Id = Guid.NewGuid(), VendorId = vendorId, Description = "Vendor does not have multiple unresolved disputes or fraud complaints on platform", IsCleared = false },
        new() { Id = Guid.NewGuid(), VendorId = vendorId, Description = "Vendor can provide a real business license or registration when asked", IsCleared = false },
        new() { Id = Guid.NewGuid(), VendorId = vendorId, Description = "Vendor's pricing is not suspiciously low compared to all other quotes (too good to be true)", IsCleared = false },
        new() { Id = Guid.NewGuid(), VendorId = vendorId, Description = "Vendor does not claim 100% virgin at non-virgin prices without explanation", IsCleared = false },
    ];
}
