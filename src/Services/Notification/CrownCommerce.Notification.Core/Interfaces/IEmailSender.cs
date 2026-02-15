namespace CrownCommerce.Notification.Core.Interfaces;

public interface IEmailSender
{
    Task<bool> SendEmailAsync(string to, string subject, string htmlBody, string? plainTextBody = null, CancellationToken ct = default);
}
