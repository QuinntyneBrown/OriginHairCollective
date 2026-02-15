using CrownCommerce.Scheduling.Core.Enums;

namespace CrownCommerce.Scheduling.Core.Entities;

public sealed class Employee
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? Phone { get; set; }
    public required string JobTitle { get; set; }
    public string? Department { get; set; }
    public required string TimeZone { get; set; }
    public EmployeeStatus Status { get; set; }
    public PresenceStatus Presence { get; set; } = PresenceStatus.Offline;
    public DateTime? LastSeenAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public ICollection<MeetingAttendee> MeetingAttendees { get; set; } = [];
}
