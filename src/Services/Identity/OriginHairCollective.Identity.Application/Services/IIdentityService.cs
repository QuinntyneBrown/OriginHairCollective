using OriginHairCollective.Identity.Application.Dtos;

namespace OriginHairCollective.Identity.Application.Services;

public interface IIdentityService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto, CancellationToken ct = default);
    Task<AuthResponseDto?> LoginAsync(LoginDto dto, CancellationToken ct = default);
    Task<UserProfileDto?> GetProfileAsync(Guid userId, CancellationToken ct = default);
    Task<UserProfileDto?> UpdateProfileAsync(Guid userId, UpdateProfileDto dto, CancellationToken ct = default);
}
