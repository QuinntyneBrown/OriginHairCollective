using CrownCommerce.Notification.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CrownCommerce.Notification.Infrastructure.Email;

/// <summary>
/// SendGrid email sender implementation. Requires manual configuration:
/// - Install SendGrid NuGet package: dotnet add package SendGrid
/// - Add "SendGrid:ApiKey" to appsettings or environment variables
/// - Add "SendGrid:FromEmail" and "SendGrid:FromName" to configuration
/// </summary>
public sealed class SendGridEmailSender(
    IConfiguration configuration,
    ILogger<SendGridEmailSender> logger) : IEmailSender
{
    public async Task<bool> SendEmailAsync(string to, string subject, string htmlBody, string? plainTextBody = null, CancellationToken ct = default)
    {
        var apiKey = configuration["SendGrid:ApiKey"];
        var fromEmail = configuration["SendGrid:FromEmail"] ?? "noreply@originhairco.ca";
        var fromName = configuration["SendGrid:FromName"] ?? "Origin Hair Collective";

        if (string.IsNullOrEmpty(apiKey))
        {
            logger.LogWarning("SendGrid API key is not configured. Email to {Recipient} with subject '{Subject}' was not sent", to, subject);
            return false;
        }

        // TODO: Uncomment after installing SendGrid package:
        // var client = new SendGridClient(apiKey);
        // var from = new EmailAddress(fromEmail, fromName);
        // var toAddress = new EmailAddress(to);
        // var msg = MailHelper.CreateSingleEmail(from, toAddress, subject, plainTextBody ?? string.Empty, htmlBody);
        // var response = await client.SendEmailAsync(msg, ct);
        //
        // if (response.IsSuccessStatusCode)
        // {
        //     logger.LogInformation("Email sent to {Recipient}: {Subject}", to, subject);
        //     return true;
        // }
        //
        // var body = await response.Body.ReadAsStringAsync(ct);
        // logger.LogError("Failed to send email to {Recipient}. Status: {Status}, Body: {Body}", to, response.StatusCode, body);
        // return false;

        logger.LogInformation("Email sending scaffolded but not active. Would send to {Recipient}: {Subject}", to, subject);
        await Task.CompletedTask;
        return true;
    }
}
