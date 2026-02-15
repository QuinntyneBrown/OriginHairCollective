namespace CrownCommerce.Scheduling.Core.Entities;

public sealed class ChannelReadReceipt
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid EmployeeId { get; set; }
    public DateTime LastReadAt { get; set; }
    public ScheduleConversation Conversation { get; set; } = null!;
    public Employee Employee { get; set; } = null!;
}
