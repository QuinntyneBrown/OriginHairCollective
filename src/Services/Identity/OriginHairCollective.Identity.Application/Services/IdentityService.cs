using System.Security.Cryptography;
using OriginHairCollective.Identity.Application.Dtos;
using OriginHairCollective.Identity.Application.Mapping;
using OriginHairCollective.Identity.Core.Entities;
using OriginHairCollective.Identity.Core.Enums;
using OriginHairCollective.Identity.Core.Interfaces;

namespace OriginHairCollective.Identity.Application.Services;

public sealed class IdentityService(IUserRepository userRepository, ITokenService tokenService) : IIdentityService
{
    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto, CancellationToken ct = default)
    {
        var existing = await userRepository.GetByEmailAsync(dto.Email, ct);
        if (existing is not null)
            throw new InvalidOperationException("An account with this email already exists.");

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = dto.Email,
            PasswordHash = HashPassword(dto.Password),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Phone = dto.Phone,
            Role = UserRole.Customer,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await userRepository.AddAsync(user, ct);

        var token = tokenService.GenerateToken(user.Id, user.Email, user.Role.ToString());
        return new AuthResponseDto(user.Id, user.Email, user.FirstName, user.LastName, token);
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto, CancellationToken ct = default)
    {
        var user = await userRepository.GetByEmailAsync(dto.Email, ct);
        if (user is null || !user.IsActive) return null;
        if (!VerifyPassword(dto.Password, user.PasswordHash)) return null;

        user.LastLoginAt = DateTime.UtcNow;
        await userRepository.UpdateAsync(user, ct);

        var token = tokenService.GenerateToken(user.Id, user.Email, user.Role.ToString());
        return new AuthResponseDto(user.Id, user.Email, user.FirstName, user.LastName, token);
    }

    public async Task<UserProfileDto?> GetProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await userRepository.GetByIdAsync(userId, ct);
        return user?.ToDto();
    }

    public async Task<UserProfileDto?> UpdateProfileAsync(Guid userId, UpdateProfileDto dto, CancellationToken ct = default)
    {
        var user = await userRepository.GetByIdAsync(userId, ct);
        if (user is null) return null;

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Phone = dto.Phone;

        await userRepository.UpdateAsync(user, ct);
        return user.ToDto();
    }

    private static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        var combined = new byte[48];
        salt.CopyTo(combined, 0);
        hash.CopyTo(combined, 16);
        return Convert.ToBase64String(combined);
    }

    private static bool VerifyPassword(string password, string storedHash)
    {
        var combined = Convert.FromBase64String(storedHash);
        var salt = combined[..16];
        var storedHashBytes = combined[16..];
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        return CryptographicOperations.FixedTimeEquals(hash, storedHashBytes);
    }
}
