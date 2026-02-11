namespace OriginHairCollective.Newsletter.Application.Email;

public sealed record EmailMessage(
    string To,
    string Subject,
    string HtmlBody,
    string? PlainTextBody,
    string FromName,
    string FromEmail,
    Dictionary<string, string>? Headers);
