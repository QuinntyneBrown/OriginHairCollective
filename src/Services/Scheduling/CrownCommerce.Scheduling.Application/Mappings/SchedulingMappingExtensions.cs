using CrownCommerce.Scheduling.Application.DTOs;
using CrownCommerce.Scheduling.Core.Entities;

namespace CrownCommerce.Scheduling.Application.Mappings;

public static class SchedulingMappingExtensions
{
    public static EmployeeDto ToDto(this Employee employee) =>
        new(employee.Id, employee.UserId, employee.Email, employee.FirstName, employee.LastName,
            employee.Phone, employee.JobTitle, employee.Department, employee.TimeZone,
            employee.Status.ToString(), employee.Presence.ToString(), employee.LastSeenAt,
            employee.CreatedAt);

    public static MeetingDto ToDto(this Meeting meeting, IReadOnlyDictionary<Guid, Employee>? employeeLookup = null) =>
        new(meeting.Id, meeting.Title, meeting.Description, meeting.StartTimeUtc, meeting.EndTimeUtc,
            meeting.Location, meeting.Status.ToString(), meeting.OrganizerId, meeting.CreatedAt,
            meeting.Attendees.Select(a => a.ToDto(employeeLookup)).ToList());

    public static MeetingAttendeeDto ToDto(this MeetingAttendee attendee, IReadOnlyDictionary<Guid, Employee>? employeeLookup = null)
    {
        var name = "Unknown";
        var email = "";
        if (employeeLookup is not null && employeeLookup.TryGetValue(attendee.EmployeeId, out var emp))
        {
            name = $"{emp.FirstName} {emp.LastName}";
            email = emp.Email;
        }
        else if (attendee.Employee is not null)
        {
            name = $"{attendee.Employee.FirstName} {attendee.Employee.LastName}";
            email = attendee.Employee.Email;
        }

        return new(attendee.Id, attendee.EmployeeId, name, email, attendee.Response.ToString(), attendee.RespondedAt);
    }

    public static CalendarEventDto ToCalendarEvent(this Meeting meeting, string organizerName) =>
        new(meeting.Id, meeting.Title, meeting.StartTimeUtc, meeting.EndTimeUtc,
            meeting.Location, meeting.Status.ToString(), meeting.Attendees.Count, organizerName);

    public static ConversationDto ToDto(this ScheduleConversation conversation) =>
        new(conversation.Id, conversation.Subject, conversation.MeetingId, conversation.Status.ToString(),
            conversation.CreatedByEmployeeId, conversation.CreatedAt, conversation.LastMessageAt,
            conversation.Messages.Select(m => m.ToDto()).ToList(),
            conversation.Participants.Select(p => p.ToDto()).ToList());

    public static ConversationSummaryDto ToSummaryDto(this ScheduleConversation conversation) =>
        new(conversation.Id, conversation.Subject, conversation.MeetingId, conversation.Status.ToString(),
            conversation.CreatedByEmployeeId, conversation.CreatedAt, conversation.LastMessageAt,
            conversation.Messages.Count, conversation.Participants.Count);

    public static ConversationMessageDto ToDto(this ConversationMessage message) =>
        new(message.Id, message.SenderEmployeeId, message.Content, message.SentAt);

    public static ConversationParticipantDto ToDto(this ConversationParticipant participant) =>
        new(participant.EmployeeId, participant.JoinedAt);

    public static ChannelDto ToChannelDto(this ScheduleConversation conversation, int unreadCount = 0)
    {
        var lastMsg = conversation.Messages.OrderByDescending(m => m.SentAt).FirstOrDefault();
        return new ChannelDto(
            conversation.Id,
            conversation.Subject,
            conversation.Icon,
            conversation.ChannelType.ToString(),
            unreadCount,
            lastMsg?.Content,
            lastMsg?.SentAt ?? conversation.LastMessageAt,
            conversation.Participants.Count);
    }

    public static ChannelMessageDto ToChannelMessageDto(this ConversationMessage message, Employee? sender) =>
        new(message.Id,
            message.SenderEmployeeId,
            sender is not null ? $"{sender.FirstName} {sender.LastName}" : "Unknown",
            sender is not null ? GetInitials(sender.FirstName, sender.LastName) : "??",
            message.Content,
            message.SentAt);

    public static string GetInitials(string firstName, string lastName)
    {
        var first = firstName.Length > 0 ? firstName[0].ToString().ToUpper() : "";
        var last = lastName.Length > 0 ? lastName[0].ToString().ToUpper() : "";
        return $"{first}{last}";
    }
}
