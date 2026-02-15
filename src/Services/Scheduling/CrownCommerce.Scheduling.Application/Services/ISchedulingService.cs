using CrownCommerce.Scheduling.Application.DTOs;

namespace CrownCommerce.Scheduling.Application.Services;

public interface ISchedulingService
{
    // Employees
    Task<IReadOnlyList<EmployeeDto>> GetEmployeesAsync(string? status = null, CancellationToken ct = default);
    Task<EmployeeDto?> GetEmployeeAsync(Guid id, CancellationToken ct = default);
    Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto, CancellationToken ct = default);
    Task<EmployeeDto> UpdateEmployeeAsync(Guid id, UpdateEmployeeDto dto, CancellationToken ct = default);
    Task<EmployeeDto> UpdatePresenceAsync(Guid employeeId, UpdatePresenceDto dto, CancellationToken ct = default);

    // Meetings
    Task<MeetingDto?> GetMeetingAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<CalendarEventDto>> GetCalendarEventsAsync(DateTime startUtc, DateTime endUtc, Guid? employeeId = null, CancellationToken ct = default);
    Task<IReadOnlyList<MeetingDto>> GetUpcomingMeetingsAsync(int count = 10, CancellationToken ct = default);
    Task<MeetingDto> CreateMeetingAsync(CreateMeetingDto dto, CancellationToken ct = default);
    Task<MeetingDto> UpdateMeetingAsync(Guid id, UpdateMeetingDto dto, CancellationToken ct = default);
    Task<MeetingDto> RespondToMeetingAsync(Guid meetingId, Guid employeeId, RespondToMeetingDto dto, CancellationToken ct = default);
    Task CancelMeetingAsync(Guid id, CancellationToken ct = default);
    Task<string> ExportMeetingToICalAsync(Guid id, CancellationToken ct = default);

    // Conversations
    Task<IReadOnlyList<ConversationSummaryDto>> GetConversationsAsync(Guid? employeeId = null, CancellationToken ct = default);
    Task<ConversationDto?> GetConversationAsync(Guid id, CancellationToken ct = default);
    Task<ConversationDto> CreateConversationAsync(CreateConversationDto dto, CancellationToken ct = default);
    Task<ConversationMessageDto> SendMessageAsync(Guid conversationId, SendMessageDto dto, CancellationToken ct = default);

    // Channels
    Task<IReadOnlyList<ChannelDto>> GetChannelsAsync(Guid employeeId, CancellationToken ct = default);
    Task<IReadOnlyList<ChannelMessageDto>> GetChannelMessagesAsync(Guid channelId, CancellationToken ct = default);
    Task<ChannelMessageDto> SendChannelMessageAsync(Guid channelId, SendChannelMessageDto dto, CancellationToken ct = default);
    Task MarkChannelAsReadAsync(Guid channelId, MarkAsReadDto dto, CancellationToken ct = default);
    Task<ChannelDto> CreateChannelAsync(CreateChannelDto dto, CancellationToken ct = default);

    // Activity Feed
    Task<IReadOnlyList<ActivityFeedItemDto>> GetActivityFeedAsync(Guid employeeId, int count = 10, CancellationToken ct = default);
}
