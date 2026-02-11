namespace OriginHairCollective.Identity.Application.Services;

public interface ITokenService
{
    string GenerateToken(Guid userId, string email, string role);
}
