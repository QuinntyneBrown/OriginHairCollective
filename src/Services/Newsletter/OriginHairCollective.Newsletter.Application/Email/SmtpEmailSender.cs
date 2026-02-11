using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace OriginHairCollective.Newsletter.Application.Email;

public sealed class SmtpEmailSender(IConfiguration configuration, ILogger<SmtpEmailSender> logger) : IEmailSender
{
    public async Task<EmailSendResult> SendAsync(EmailMessage message, CancellationToken ct = default)
    {
        try
        {
            using var client = CreateSmtpClient();
            using var mailMessage = CreateMailMessage(message);
            await client.SendMailAsync(mailMessage, ct);

            logger.LogInformation("Email sent to {Recipient}", message.To);
            return new EmailSendResult(message.To, true, null, null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {Recipient}", message.To);
            return new EmailSendResult(message.To, false, null, ex.Message);
        }
    }

    public async Task<IReadOnlyList<EmailSendResult>> SendBatchAsync(
        IReadOnlyList<EmailMessage> messages, CancellationToken ct = default)
    {
        var results = new List<EmailSendResult>(messages.Count);

        using var client = CreateSmtpClient();

        foreach (var message in messages)
        {
            if (ct.IsCancellationRequested)
                break;

            try
            {
                using var mailMessage = CreateMailMessage(message);
                await client.SendMailAsync(mailMessage, ct);
                results.Add(new EmailSendResult(message.To, true, null, null));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send email to {Recipient}", message.To);
                results.Add(new EmailSendResult(message.To, false, null, ex.Message));
            }
        }

        return results;
    }

    private SmtpClient CreateSmtpClient()
    {
        var host = configuration["Email:Smtp:Host"] ?? "localhost";
        var port = int.Parse(configuration["Email:Smtp:Port"] ?? "1025");
        var useSsl = bool.Parse(configuration["Email:Smtp:UseSsl"] ?? "false");
        var username = configuration["Email:Smtp:Username"];
        var password = configuration["Email:Smtp:Password"];

        var client = new SmtpClient(host, port)
        {
            EnableSsl = useSsl
        };

        if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
        {
            client.Credentials = new NetworkCredential(username, password);
        }

        return client;
    }

    private static MailMessage CreateMailMessage(EmailMessage message)
    {
        var mailMessage = new MailMessage
        {
            From = new MailAddress(message.FromEmail, message.FromName),
            Subject = message.Subject,
            Body = message.HtmlBody,
            IsBodyHtml = true
        };

        mailMessage.To.Add(message.To);

        if (!string.IsNullOrEmpty(message.PlainTextBody))
        {
            mailMessage.AlternateViews.Add(
                AlternateView.CreateAlternateViewFromString(message.PlainTextBody, null, "text/plain"));
        }

        if (message.Headers is not null)
        {
            foreach (var header in message.Headers)
            {
                mailMessage.Headers.Add(header.Key, header.Value);
            }
        }

        return mailMessage;
    }
}
