using OriginHairCollective.Identity.Application.Dtos;
using OriginHairCollective.Identity.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace OriginHairCollective.Identity.Api.Controllers;

[ApiController]
[Route("auth")]
public sealed class AuthController(IIdentityService identityService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto, CancellationToken ct)
    {
        var result = await identityService.RegisterAsync(dto, ct);
        return CreatedAtAction(nameof(GetProfile), new { userId = result.UserId }, result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto, CancellationToken ct)
    {
        var result = await identityService.LoginAsync(dto, ct);
        return result is null ? Unauthorized() : Ok(result);
    }

    [HttpGet("profile/{userId:guid}")]
    public async Task<IActionResult> GetProfile(Guid userId, CancellationToken ct)
    {
        var profile = await identityService.GetProfileAsync(userId, ct);
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpPut("profile/{userId:guid}")]
    public async Task<IActionResult> UpdateProfile(Guid userId, [FromBody] UpdateProfileDto dto, CancellationToken ct)
    {
        var profile = await identityService.UpdateProfileAsync(userId, dto, ct);
        return profile is null ? NotFound() : Ok(profile);
    }
}
