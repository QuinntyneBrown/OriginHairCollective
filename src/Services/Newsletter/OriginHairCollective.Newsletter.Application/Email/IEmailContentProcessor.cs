namespace OriginHairCollective.Newsletter.Application.Email;

public interface IEmailContentProcessor
{
    string ProcessHtml(string htmlBody, Guid campaignId, Guid subscriberId, string unsubscribeToken);
}
