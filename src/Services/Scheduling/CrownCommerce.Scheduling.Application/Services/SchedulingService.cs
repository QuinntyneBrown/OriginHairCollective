using CrownCommerce.Scheduling.Application.DTOs;
using CrownCommerce.Scheduling.Application.Mappings;
using CrownCommerce.Scheduling.Core.Entities;
using CrownCommerce.Scheduling.Core.Enums;
using CrownCommerce.Scheduling.Core.Interfaces;
using CrownCommerce.Shared.Contracts;
using MassTransit;

namespace CrownCommerce.Scheduling.Application.Services;

public sealed class SchedulingService(
    IEmployeeRepository employeeRepo,
    IMeetingRepository meetingRepo,
    IConversationRepository conversationRepo,
    IPublishEndpoint publishEndpoint) : ISchedulingService
{
    // ─── Employees ──────────────────────────────────────────────────────

    public async Task<IReadOnlyList<EmployeeDto>> GetEmployeesAsync(string? status = null, CancellationToken ct = default)
    {
        EmployeeStatus? statusFilter = status is not null && Enum.TryParse<EmployeeStatus>(status, true, out var s) ? s : null;
        var employees = await employeeRepo.GetAllAsync(statusFilter, ct);
        return employees.Select(e => e.ToDto()).ToList();
    }

    public async Task<EmployeeDto?> GetEmployeeAsync(Guid id, CancellationToken ct = default)
    {
        var employee = await employeeRepo.GetByIdAsync(id, ct);
        return employee?.ToDto();
    }

    public async Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto, CancellationToken ct = default)
    {
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Phone = dto.Phone,
            JobTitle = dto.JobTitle,
            Department = dto.Department,
            TimeZone = dto.TimeZone,
            Status = EmployeeStatus.Active,
            CreatedAt = DateTime.UtcNow,
        };

        await employeeRepo.AddAsync(employee, ct);
        return employee.ToDto();
    }

    public async Task<EmployeeDto> UpdateEmployeeAsync(Guid id, UpdateEmployeeDto dto, CancellationToken ct = default)
    {
        var employee = await employeeRepo.GetByIdAsync(id, ct)
            ?? throw new InvalidOperationException($"Employee {id} not found");

        if (dto.Phone is not null) employee.Phone = dto.Phone;
        if (dto.JobTitle is not null) employee.JobTitle = dto.JobTitle;
        if (dto.Department is not null) employee.Department = dto.Department;
        if (dto.TimeZone is not null) employee.TimeZone = dto.TimeZone;
        if (dto.Status is not null && Enum.TryParse<EmployeeStatus>(dto.Status, true, out var s))
            employee.Status = s;

        employee.UpdatedAt = DateTime.UtcNow;
        await employeeRepo.UpdateAsync(employee, ct);
        return employee.ToDto();
    }

    // ─── Meetings ───────────────────────────────────────────────────────

    public async Task<MeetingDto?> GetMeetingAsync(Guid id, CancellationToken ct = default)
    {
        var meeting = await meetingRepo.GetByIdAsync(id, ct);
        if (meeting is null) return null;

        var employeeIds = meeting.Attendees.Select(a => a.EmployeeId).Append(meeting.OrganizerId).Distinct();
        var employees = await employeeRepo.GetByIdsAsync(employeeIds, ct);
        var lookup = employees.ToDictionary(e => e.Id);

        return meeting.ToDto(lookup);
    }

    public async Task<IReadOnlyList<CalendarEventDto>> GetCalendarEventsAsync(
        DateTime startUtc, DateTime endUtc, Guid? employeeId = null, CancellationToken ct = default)
    {
        var meetings = employeeId.HasValue
            ? await meetingRepo.GetByEmployeeAsync(employeeId.Value, startUtc, endUtc, ct)
            : await meetingRepo.GetByDateRangeAsync(startUtc, endUtc, ct);

        var organizerIds = meetings.Select(m => m.OrganizerId).Distinct();
        var organizers = await employeeRepo.GetByIdsAsync(organizerIds, ct);
        var lookup = organizers.ToDictionary(e => e.Id);

        return meetings.Select(m =>
        {
            var organizerName = lookup.TryGetValue(m.OrganizerId, out var org)
                ? $"{org.FirstName} {org.LastName}" : "Unknown";
            return m.ToCalendarEvent(organizerName);
        }).ToList();
    }

    public async Task<IReadOnlyList<MeetingDto>> GetUpcomingMeetingsAsync(int count = 10, CancellationToken ct = default)
    {
        var meetings = await meetingRepo.GetUpcomingAsync(count, ct);
        var allEmployeeIds = meetings
            .SelectMany(m => m.Attendees.Select(a => a.EmployeeId).Append(m.OrganizerId))
            .Distinct();
        var employees = await employeeRepo.GetByIdsAsync(allEmployeeIds, ct);
        var lookup = employees.ToDictionary(e => e.Id);

        return meetings.Select(m => m.ToDto(lookup)).ToList();
    }

    public async Task<MeetingDto> CreateMeetingAsync(CreateMeetingDto dto, CancellationToken ct = default)
    {
        var meeting = new Meeting
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            StartTimeUtc = dto.StartTimeUtc,
            EndTimeUtc = dto.EndTimeUtc,
            Location = dto.Location,
            Status = MeetingStatus.Scheduled,
            OrganizerId = dto.OrganizerId,
            CreatedAt = DateTime.UtcNow,
        };

        foreach (var employeeId in dto.AttendeeEmployeeIds.Distinct())
        {
            meeting.Attendees.Add(new MeetingAttendee
            {
                Id = Guid.NewGuid(),
                MeetingId = meeting.Id,
                EmployeeId = employeeId,
                Response = AttendeeResponse.Pending,
            });
        }

        await meetingRepo.AddAsync(meeting, ct);

        // Publish event for email notification
        var attendees = await employeeRepo.GetByIdsAsync(dto.AttendeeEmployeeIds, ct);
        var organizer = await employeeRepo.GetByIdAsync(dto.OrganizerId, ct);

        await publishEndpoint.Publish(new MeetingBookedEvent(
            meeting.Id,
            meeting.Title,
            meeting.StartTimeUtc,
            meeting.EndTimeUtc,
            meeting.Location,
            organizer?.Email ?? "",
            $"{organizer?.FirstName} {organizer?.LastName}",
            attendees.Select(a => a.Email).ToList(),
            DateTime.UtcNow), ct);

        var allIds = dto.AttendeeEmployeeIds.Append(dto.OrganizerId).Distinct();
        var allEmployees = await employeeRepo.GetByIdsAsync(allIds, ct);
        var lookup = allEmployees.ToDictionary(e => e.Id);

        return meeting.ToDto(lookup);
    }

    public async Task<MeetingDto> UpdateMeetingAsync(Guid id, UpdateMeetingDto dto, CancellationToken ct = default)
    {
        var meeting = await meetingRepo.GetByIdAsync(id, ct)
            ?? throw new InvalidOperationException($"Meeting {id} not found");

        if (dto.Title is not null) meeting.Title = dto.Title;
        if (dto.Description is not null) meeting.Description = dto.Description;
        if (dto.StartTimeUtc.HasValue) meeting.StartTimeUtc = dto.StartTimeUtc.Value;
        if (dto.EndTimeUtc.HasValue) meeting.EndTimeUtc = dto.EndTimeUtc.Value;
        if (dto.Location is not null) meeting.Location = dto.Location;
        if (dto.Status is not null && Enum.TryParse<MeetingStatus>(dto.Status, true, out var s))
            meeting.Status = s;

        meeting.UpdatedAt = DateTime.UtcNow;
        await meetingRepo.UpdateAsync(meeting, ct);

        var employeeIds = meeting.Attendees.Select(a => a.EmployeeId).Append(meeting.OrganizerId).Distinct();
        var employees = await employeeRepo.GetByIdsAsync(employeeIds, ct);
        var lookup = employees.ToDictionary(e => e.Id);

        return meeting.ToDto(lookup);
    }

    public async Task<MeetingDto> RespondToMeetingAsync(Guid meetingId, Guid employeeId, RespondToMeetingDto dto, CancellationToken ct = default)
    {
        var meeting = await meetingRepo.GetByIdAsync(meetingId, ct)
            ?? throw new InvalidOperationException($"Meeting {meetingId} not found");

        var attendee = meeting.Attendees.FirstOrDefault(a => a.EmployeeId == employeeId)
            ?? throw new InvalidOperationException($"Employee {employeeId} is not an attendee of meeting {meetingId}");

        if (Enum.TryParse<AttendeeResponse>(dto.Response, true, out var response))
        {
            attendee.Response = response;
            attendee.RespondedAt = DateTime.UtcNow;
        }

        await meetingRepo.UpdateAsync(meeting, ct);

        var employeeIds = meeting.Attendees.Select(a => a.EmployeeId).Append(meeting.OrganizerId).Distinct();
        var employees = await employeeRepo.GetByIdsAsync(employeeIds, ct);
        var lookup = employees.ToDictionary(e => e.Id);

        return meeting.ToDto(lookup);
    }

    public async Task CancelMeetingAsync(Guid id, CancellationToken ct = default)
    {
        var meeting = await meetingRepo.GetByIdAsync(id, ct)
            ?? throw new InvalidOperationException($"Meeting {id} not found");

        meeting.Status = MeetingStatus.Cancelled;
        meeting.UpdatedAt = DateTime.UtcNow;
        await meetingRepo.UpdateAsync(meeting, ct);

        var attendees = await employeeRepo.GetByIdsAsync(meeting.Attendees.Select(a => a.EmployeeId), ct);

        await publishEndpoint.Publish(new MeetingCancelledEvent(
            meeting.Id,
            meeting.Title,
            meeting.StartTimeUtc,
            attendees.Select(a => a.Email).ToList(),
            DateTime.UtcNow), ct);
    }

    public async Task<string> ExportMeetingToICalAsync(Guid id, CancellationToken ct = default)
    {
        var meeting = await meetingRepo.GetByIdAsync(id, ct)
            ?? throw new InvalidOperationException($"Meeting {id} not found");

        var organizer = await employeeRepo.GetByIdAsync(meeting.OrganizerId, ct);
        var attendees = await employeeRepo.GetByIdsAsync(meeting.Attendees.Select(a => a.EmployeeId), ct);

        return GenerateICal(meeting, organizer, attendees);
    }

    public async Task<EmployeeDto> UpdatePresenceAsync(Guid employeeId, UpdatePresenceDto dto, CancellationToken ct = default)
    {
        var employee = await employeeRepo.GetByIdAsync(employeeId, ct)
            ?? throw new InvalidOperationException($"Employee {employeeId} not found");

        if (Enum.TryParse<PresenceStatus>(dto.Presence, true, out var presence))
        {
            employee.Presence = presence;
            employee.LastSeenAt = DateTime.UtcNow;
            employee.UpdatedAt = DateTime.UtcNow;
            await employeeRepo.UpdateAsync(employee, ct);
        }

        return employee.ToDto();
    }

    // ─── Conversations ──────────────────────────────────────────────────

    public async Task<IReadOnlyList<ConversationSummaryDto>> GetConversationsAsync(Guid? employeeId = null, CancellationToken ct = default)
    {
        var conversations = employeeId.HasValue
            ? await conversationRepo.GetByEmployeeAsync(employeeId.Value, ct)
            : await conversationRepo.GetRecentAsync(50, ct);

        return conversations.Select(c => c.ToSummaryDto()).ToList();
    }

    public async Task<ConversationDto?> GetConversationAsync(Guid id, CancellationToken ct = default)
    {
        var conversation = await conversationRepo.GetByIdAsync(id, ct);
        return conversation?.ToDto();
    }

    public async Task<ConversationDto> CreateConversationAsync(CreateConversationDto dto, CancellationToken ct = default)
    {
        var conversation = new ScheduleConversation
        {
            Id = Guid.NewGuid(),
            Subject = dto.Subject,
            MeetingId = dto.MeetingId,
            Status = ConversationStatus.Active,
            CreatedByEmployeeId = dto.CreatedByEmployeeId,
            CreatedAt = DateTime.UtcNow,
        };

        var allParticipants = dto.ParticipantEmployeeIds.Append(dto.CreatedByEmployeeId).Distinct();
        foreach (var participantId in allParticipants)
        {
            conversation.Participants.Add(new ConversationParticipant
            {
                Id = Guid.NewGuid(),
                ConversationId = conversation.Id,
                EmployeeId = participantId,
                JoinedAt = DateTime.UtcNow,
            });
        }

        if (dto.InitialMessage is not null)
        {
            conversation.Messages.Add(new ConversationMessage
            {
                Id = Guid.NewGuid(),
                ConversationId = conversation.Id,
                SenderEmployeeId = dto.CreatedByEmployeeId,
                Content = dto.InitialMessage,
                SentAt = DateTime.UtcNow,
            });
            conversation.LastMessageAt = DateTime.UtcNow;
        }

        await conversationRepo.AddAsync(conversation, ct);
        return conversation.ToDto();
    }

    public async Task<ConversationMessageDto> SendMessageAsync(Guid conversationId, SendMessageDto dto, CancellationToken ct = default)
    {
        var message = new ConversationMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            SenderEmployeeId = dto.SenderEmployeeId,
            Content = dto.Content,
            SentAt = DateTime.UtcNow,
        };

        await conversationRepo.AddMessageAsync(message, ct);
        return message.ToDto();
    }

    // ─── Channels ─────────────────────────────────────────────────────

    public async Task<IReadOnlyList<ChannelDto>> GetChannelsAsync(Guid employeeId, CancellationToken ct = default)
    {
        var channels = await conversationRepo.GetChannelsByTypeAsync(null, ct);

        // Filter to channels the employee is a participant of
        channels = channels
            .Where(c => c.Participants.Any(p => p.EmployeeId == employeeId))
            .ToList();

        var result = new List<ChannelDto>();
        foreach (var channel in channels)
        {
            var unread = await conversationRepo.GetUnreadCountAsync(channel.Id, employeeId, ct);
            result.Add(channel.ToChannelDto(unread));
        }

        return result;
    }

    public async Task<IReadOnlyList<ChannelMessageDto>> GetChannelMessagesAsync(Guid channelId, CancellationToken ct = default)
    {
        var conversation = await conversationRepo.GetByIdAsync(channelId, ct);
        if (conversation is null) return [];

        var senderIds = conversation.Messages.Select(m => m.SenderEmployeeId).Distinct();
        var employees = await employeeRepo.GetByIdsAsync(senderIds, ct);
        var lookup = employees.ToDictionary(e => e.Id);

        return conversation.Messages
            .OrderBy(m => m.SentAt)
            .Select(m => m.ToChannelMessageDto(lookup.GetValueOrDefault(m.SenderEmployeeId)))
            .ToList();
    }

    public async Task<ChannelMessageDto> SendChannelMessageAsync(Guid channelId, SendChannelMessageDto dto, CancellationToken ct = default)
    {
        var message = new ConversationMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = channelId,
            SenderEmployeeId = dto.SenderEmployeeId,
            Content = dto.Content,
            SentAt = DateTime.UtcNow,
        };

        await conversationRepo.AddMessageAsync(message, ct);

        var sender = await employeeRepo.GetByIdAsync(dto.SenderEmployeeId, ct);
        return message.ToChannelMessageDto(sender);
    }

    public async Task MarkChannelAsReadAsync(Guid channelId, MarkAsReadDto dto, CancellationToken ct = default)
    {
        var receipt = new ChannelReadReceipt
        {
            Id = Guid.NewGuid(),
            ConversationId = channelId,
            EmployeeId = dto.EmployeeId,
            LastReadAt = DateTime.UtcNow,
        };

        await conversationRepo.UpsertReadReceiptAsync(receipt, ct);
    }

    public async Task<ChannelDto> CreateChannelAsync(CreateChannelDto dto, CancellationToken ct = default)
    {
        if (!Enum.TryParse<ChannelType>(dto.ChannelType, true, out var channelType))
            channelType = ChannelType.Public;

        var conversation = new ScheduleConversation
        {
            Id = Guid.NewGuid(),
            Subject = dto.Name,
            Icon = dto.Icon,
            ChannelType = channelType,
            Status = ConversationStatus.Active,
            CreatedByEmployeeId = dto.CreatedByEmployeeId,
            CreatedAt = DateTime.UtcNow,
        };

        var allParticipants = dto.ParticipantEmployeeIds.Append(dto.CreatedByEmployeeId).Distinct();
        foreach (var participantId in allParticipants)
        {
            conversation.Participants.Add(new ConversationParticipant
            {
                Id = Guid.NewGuid(),
                ConversationId = conversation.Id,
                EmployeeId = participantId,
                JoinedAt = DateTime.UtcNow,
            });
        }

        await conversationRepo.AddAsync(conversation, ct);
        return conversation.ToChannelDto();
    }

    // ─── Activity Feed ───────────────────────────────────────────────

    public async Task<IReadOnlyList<ActivityFeedItemDto>> GetActivityFeedAsync(Guid employeeId, int count = 10, CancellationToken ct = default)
    {
        var items = new List<ActivityFeedItemDto>();

        // Recent messages across all channels
        var recentMessages = await conversationRepo.GetRecentMessagesAsync(count, ct);
        foreach (var msg in recentMessages)
        {
            var sender = await employeeRepo.GetByIdAsync(msg.SenderEmployeeId, ct);
            var senderName = sender is not null ? $"{sender.FirstName} {sender.LastName}" : "Unknown";
            items.Add(new ActivityFeedItemDto(
                msg.Id,
                "message",
                "chat",
                $"New message from {senderName}",
                msg.Content.Length > 80 ? msg.Content[..80] + "..." : msg.Content,
                msg.SentAt));
        }

        // Upcoming meetings
        var meetings = await meetingRepo.GetUpcomingAsync(count, ct);
        foreach (var meeting in meetings)
        {
            items.Add(new ActivityFeedItemDto(
                meeting.Id,
                "meeting",
                "videocam",
                meeting.Title,
                $"{meeting.StartTimeUtc:g} - {meeting.Attendees.Count} attendees",
                meeting.StartTimeUtc));
        }

        return items
            .OrderByDescending(i => i.OccurredAt)
            .Take(count)
            .ToList();
    }

    // ─── Helpers ────────────────────────────────────────────────────────

    private static string GenerateICal(Meeting meeting, Employee? organizer, IReadOnlyList<Employee> attendees)
    {
        var lines = new List<string>
        {
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//CrownCommerce//Scheduling//EN",
            "BEGIN:VEVENT",
            $"UID:{meeting.Id}@crowncommerce.com",
            $"DTSTART:{meeting.StartTimeUtc:yyyyMMdd'T'HHmmss'Z'}",
            $"DTEND:{meeting.EndTimeUtc:yyyyMMdd'T'HHmmss'Z'}",
            $"SUMMARY:{EscapeICalText(meeting.Title)}",
        };

        if (meeting.Description is not null)
            lines.Add($"DESCRIPTION:{EscapeICalText(meeting.Description)}");

        if (meeting.Location is not null)
            lines.Add($"LOCATION:{EscapeICalText(meeting.Location)}");

        if (organizer is not null)
            lines.Add($"ORGANIZER;CN={organizer.FirstName} {organizer.LastName}:mailto:{organizer.Email}");

        foreach (var attendee in attendees)
            lines.Add($"ATTENDEE;CN={attendee.FirstName} {attendee.LastName}:mailto:{attendee.Email}");

        lines.Add($"DTSTAMP:{DateTime.UtcNow:yyyyMMdd'T'HHmmss'Z'}");
        lines.Add("END:VEVENT");
        lines.Add("END:VCALENDAR");

        return string.Join("\r\n", lines);
    }

    private static string EscapeICalText(string text) =>
        text.Replace("\\", "\\\\").Replace(";", "\\;").Replace(",", "\\,").Replace("\n", "\\n");
}
