using Gym3000.Api.Dtos;
using Gym3000.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Gym3000.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(UserManager<IdentityUser> um, IJwtService jwt) : ControllerBase
{
    /// <summary>Registrierung</summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var existing = await um.FindByEmailAsync(dto.Email);
        if (existing is not null)
            return BadRequest(new { message = "E-Mail ist bereits registriert." });

        var user = new IdentityUser
        {
            Email = dto.Email,
            UserName = dto.Email,
            EmailConfirmed = true
        };

        var result = await um.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToArray();
            return BadRequest(new { message = "Registrierung fehlgeschlagen.", errors });
        }

        var token = jwt.Create(user.Id, user.Email!);
        return Ok(new AuthResponseDto(user.Id, user.Email!, token));
    }

    /// <summary>Login</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var user = await um.FindByEmailAsync(dto.Email);
        if (user is null)
            return Unauthorized(new { message = "Ungültige Anmeldedaten." });

        var ok = await um.CheckPasswordAsync(user, dto.Password);
        if (!ok)
            return Unauthorized(new { message = "Ungültige Anmeldedaten." });

        var token = jwt.Create(user.Id, user.Email!);
        return Ok(new AuthResponseDto(user.Id, user.Email!, token));
    }
}
