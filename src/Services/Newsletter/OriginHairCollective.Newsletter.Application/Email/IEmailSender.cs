namespace OriginHairCollective.Newsletter.Application.Email;

public interface IEmailSender
{
    Task<EmailSendResult> SendAsync(EmailMessage message, CancellationToken ct = default);
    Task<IReadOnlyList<EmailSendResult>> SendBatchAsync(
        IReadOnlyList<EmailMessage> messages, CancellationToken ct = default);
}
