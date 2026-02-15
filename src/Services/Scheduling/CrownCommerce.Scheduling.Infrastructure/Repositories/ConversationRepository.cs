using CrownCommerce.Scheduling.Core.Entities;
using CrownCommerce.Scheduling.Core.Enums;
using CrownCommerce.Scheduling.Core.Interfaces;
using CrownCommerce.Scheduling.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CrownCommerce.Scheduling.Infrastructure.Repositories;

public sealed class ConversationRepository(SchedulingDbContext context) : IConversationRepository
{
    public async Task<ScheduleConversation?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await context.Conversations
            .Include(c => c.Messages.OrderBy(m => m.SentAt))
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == id, ct);
    }

    public async Task<IReadOnlyList<ScheduleConversation>> GetByEmployeeAsync(Guid employeeId, CancellationToken ct = default)
    {
        return await context.Conversations
            .AsNoTracking()
            .Include(c => c.Participants)
            .Where(c => c.CreatedByEmployeeId == employeeId
                || c.Participants.Any(p => p.EmployeeId == employeeId))
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<ScheduleConversation>> GetByMeetingAsync(Guid meetingId, CancellationToken ct = default)
    {
        return await context.Conversations
            .AsNoTracking()
            .Include(c => c.Messages.OrderBy(m => m.SentAt))
            .Include(c => c.Participants)
            .Where(c => c.MeetingId == meetingId)
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<ScheduleConversation>> GetRecentAsync(int count = 20, CancellationToken ct = default)
    {
        return await context.Conversations
            .AsNoTracking()
            .Include(c => c.Participants)
            .Where(c => c.Status == ConversationStatus.Active)
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .Take(count)
            .ToListAsync(ct);
    }

    public async Task AddAsync(ScheduleConversation conversation, CancellationToken ct = default)
    {
        context.Conversations.Add(conversation);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(ScheduleConversation conversation, CancellationToken ct = default)
    {
        context.Conversations.Update(conversation);
        await context.SaveChangesAsync(ct);
    }

    public async Task AddMessageAsync(ConversationMessage message, CancellationToken ct = default)
    {
        context.ConversationMessages.Add(message);

        var conversation = await context.Conversations.FindAsync([message.ConversationId], ct);
        if (conversation is not null)
        {
            conversation.LastMessageAt = message.SentAt;
        }

        await context.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<ScheduleConversation>> GetChannelsByTypeAsync(ChannelType? channelType = null, CancellationToken ct = default)
    {
        var query = context.Conversations
            .AsNoTracking()
            .Include(c => c.Participants)
            .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
            .Where(c => c.Status == ConversationStatus.Active);

        if (channelType.HasValue)
            query = query.Where(c => c.ChannelType == channelType.Value);

        return await query
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<ChannelReadReceipt?> GetReadReceiptAsync(Guid conversationId, Guid employeeId, CancellationToken ct = default)
    {
        return await context.ChannelReadReceipts
            .FirstOrDefaultAsync(r => r.ConversationId == conversationId && r.EmployeeId == employeeId, ct);
    }

    public async Task UpsertReadReceiptAsync(ChannelReadReceipt receipt, CancellationToken ct = default)
    {
        var existing = await context.ChannelReadReceipts
            .FirstOrDefaultAsync(r => r.ConversationId == receipt.ConversationId && r.EmployeeId == receipt.EmployeeId, ct);

        if (existing is not null)
        {
            existing.LastReadAt = receipt.LastReadAt;
        }
        else
        {
            context.ChannelReadReceipts.Add(receipt);
        }

        await context.SaveChangesAsync(ct);
    }

    public async Task<int> GetUnreadCountAsync(Guid conversationId, Guid employeeId, CancellationToken ct = default)
    {
        var receipt = await GetReadReceiptAsync(conversationId, employeeId, ct);
        if (receipt is null)
        {
            return await context.ConversationMessages
                .CountAsync(m => m.ConversationId == conversationId, ct);
        }

        return await context.ConversationMessages
            .CountAsync(m => m.ConversationId == conversationId && m.SentAt > receipt.LastReadAt, ct);
    }

    public async Task<IReadOnlyList<ConversationMessage>> GetRecentMessagesAsync(int count = 20, CancellationToken ct = default)
    {
        return await context.ConversationMessages
            .AsNoTracking()
            .OrderByDescending(m => m.SentAt)
            .Take(count)
            .ToListAsync(ct);
    }
}
