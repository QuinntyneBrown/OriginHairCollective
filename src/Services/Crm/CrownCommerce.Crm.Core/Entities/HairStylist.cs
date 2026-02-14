namespace CrownCommerce.Crm.Core.Entities;

public sealed class HairStylist : Contact
{
    public HairStylist()
    {
        ContactType = "HairStylist";
    }

    public string? SalonAffiliation { get; set; }
    public Guid? SalonId { get; set; }
    public string? LicenseNumber { get; set; }
    public int YearsExperience { get; set; }
    public string? Specialties { get; set; }
    public string? InstagramHandle { get; set; }
    public string? TikTokHandle { get; set; }
    public int FollowerCount { get; set; }
    public bool InfluencerProgram { get; set; }
}
