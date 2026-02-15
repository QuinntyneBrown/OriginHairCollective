using CrownCommerce.Scheduling.Core.Enums;

namespace CrownCommerce.Scheduling.Core.Entities;

public sealed class ScheduleConversation
{
    public Guid Id { get; set; }
    public required string Subject { get; set; }
    public Guid? MeetingId { get; set; }
    public ConversationStatus Status { get; set; }
    public ChannelType ChannelType { get; set; }
    public string? Icon { get; set; }
    public Guid CreatedByEmployeeId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public ICollection<ConversationMessage> Messages { get; set; } = [];
    public ICollection<ConversationParticipant> Participants { get; set; } = [];
    public ICollection<ChannelReadReceipt> ReadReceipts { get; set; } = [];
}
