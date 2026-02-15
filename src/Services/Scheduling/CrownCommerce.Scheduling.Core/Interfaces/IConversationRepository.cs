using CrownCommerce.Scheduling.Core.Entities;
using CrownCommerce.Scheduling.Core.Enums;

namespace CrownCommerce.Scheduling.Core.Interfaces;

public interface IConversationRepository
{
    Task<ScheduleConversation?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<ScheduleConversation>> GetByEmployeeAsync(Guid employeeId, CancellationToken ct = default);
    Task<IReadOnlyList<ScheduleConversation>> GetByMeetingAsync(Guid meetingId, CancellationToken ct = default);
    Task<IReadOnlyList<ScheduleConversation>> GetRecentAsync(int count = 20, CancellationToken ct = default);
    Task AddAsync(ScheduleConversation conversation, CancellationToken ct = default);
    Task UpdateAsync(ScheduleConversation conversation, CancellationToken ct = default);
    Task AddMessageAsync(ConversationMessage message, CancellationToken ct = default);
    Task<IReadOnlyList<ScheduleConversation>> GetChannelsByTypeAsync(ChannelType? channelType = null, CancellationToken ct = default);
    Task<ChannelReadReceipt?> GetReadReceiptAsync(Guid conversationId, Guid employeeId, CancellationToken ct = default);
    Task UpsertReadReceiptAsync(ChannelReadReceipt receipt, CancellationToken ct = default);
    Task<int> GetUnreadCountAsync(Guid conversationId, Guid employeeId, CancellationToken ct = default);
    Task<IReadOnlyList<ConversationMessage>> GetRecentMessagesAsync(int count = 20, CancellationToken ct = default);
}
