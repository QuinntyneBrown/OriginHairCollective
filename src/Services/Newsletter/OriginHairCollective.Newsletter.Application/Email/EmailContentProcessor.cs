using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;

namespace OriginHairCollective.Newsletter.Application.Email;

public sealed partial class EmailContentProcessor(IConfiguration configuration) : IEmailContentProcessor
{
    public string ProcessHtml(string htmlBody, Guid campaignId, Guid subscriberId, string unsubscribeToken)
    {
        var baseUrl = configuration["Newsletter:BaseUrl"] ?? "https://originhair.com";
        var processed = htmlBody;

        // Rewrite links for click tracking
        processed = LinkRegex().Replace(processed, match =>
        {
            var originalUrl = match.Groups[1].Value;
            var encodedUrl = Uri.EscapeDataString(originalUrl);
            var trackingUrl = $"{baseUrl}/api/newsletters/track/click?cid={campaignId}&sid={subscriberId}&url={encodedUrl}";
            return $"href=\"{trackingUrl}\"";
        });

        // Inject tracking pixel before closing </body> tag
        var trackingPixel = $"<img src=\"{baseUrl}/api/newsletters/track/open?cid={campaignId}&sid={subscriberId}\" width=\"1\" height=\"1\" alt=\"\" style=\"display:none\" />";
        var unsubscribeLink = $"{baseUrl}/api/newsletters/unsubscribe?token={unsubscribeToken}";
        var footer = $"<div style=\"text-align:center;padding:20px;font-size:12px;color:#999;\"><a href=\"{unsubscribeLink}\" style=\"color:#999;\">Unsubscribe</a></div>";

        if (processed.Contains("</body>", StringComparison.OrdinalIgnoreCase))
        {
            processed = processed.Replace("</body>", $"{footer}{trackingPixel}</body>", StringComparison.OrdinalIgnoreCase);
        }
        else
        {
            processed += footer + trackingPixel;
        }

        return processed;
    }

    [GeneratedRegex("href=\"(https?://[^\"]+)\"", RegexOptions.IgnoreCase)]
    private static partial Regex LinkRegex();
}
