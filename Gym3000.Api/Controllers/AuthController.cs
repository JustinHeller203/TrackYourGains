using System.Security.Claims;
using Gym3000.Api.Dtos;
using Gym3000.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Gym3000.Api.Data;

namespace Gym3000.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _um;
    private readonly IJwtService _jwt;
    private readonly ApplicationDbContext _db;

    public AuthController(UserManager<IdentityUser> um, IJwtService jwt, ApplicationDbContext db)
    {
        _um = um;
        _jwt = jwt;
        _db = db;
    }

    /// <summary>Registrierung</summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var existing = await _um.FindByEmailAsync(dto.Email);
        if (existing is not null)
            return BadRequest(new { message = "E-Mail ist bereits registriert." });

        var user = new IdentityUser
        {
            Email = dto.Email,
            UserName = dto.Email,
            EmailConfirmed = true
        };

        var result = await _um.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToArray();
            return BadRequest(new { message = "Registrierung fehlgeschlagen.", errors });
        }

        var token = _jwt.Create(user.Id, user.Email!);
        return Ok(new AuthResponseDto(user.Id, user.Email!, token));
    }

    /// <summary>Login</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var user = await _um.FindByEmailAsync(dto.Email);
        if (user is null) return Unauthorized(new { message = "Ungültige Anmeldedaten." });

        var ok = await _um.CheckPasswordAsync(user, dto.Password);
        if (!ok) return Unauthorized(new { message = "Ungültige Anmeldedaten." });

        var token = _jwt.Create(user.Id, user.Email!);
        return Ok(new AuthResponseDto(user.Id, user.Email!, token));
    }

    /// <summary>Passwort ändern (nur eingeloggt)</summary>
    [Authorize]
    [HttpPost("change-password")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        // UserId robust aus Claims ziehen (NameIdentifier ODER Sub)
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        var user = await _um.FindByIdAsync(userId);
        if (user is null)
            return Unauthorized(new { message = "User nicht gefunden." });

        var result = await _um.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToArray();
            return BadRequest(new { message = "Passwortänderung fehlgeschlagen.", errors });
        }

        var token = _jwt.Create(user.Id, user.Email!);
        return Ok(new AuthResponseDto(user.Id, user.Email!, token));
    }

    [Authorize]
    [HttpPost("change-email")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        var user = await _um.FindByIdAsync(userId);
        if (user is null) return Unauthorized(new { message = "User nicht gefunden." });

        // Passwort prüfen
        var pwOk = await _um.CheckPasswordAsync(user, dto.Password);
        if (!pwOk) return BadRequest(new { message = "Passwort ist falsch." });

        // bereits vergeben?
        var exists = await _um.FindByEmailAsync(dto.NewEmail);
        if (exists is not null && exists.Id != user.Id)
            return BadRequest(new { message = "Diese E-Mail ist bereits registriert." });

        // setzen (IdentityCore, unique email -> validiert)
        var setEmail = await _um.SetEmailAsync(user, dto.NewEmail);
        if (!setEmail.Succeeded)
            return BadRequest(new { message = "E-Mail konnte nicht gesetzt werden.", errors = setEmail.Errors.Select(e => e.Description) });

        var setUserName = await _um.SetUserNameAsync(user, dto.NewEmail); // Username == Email bei dir
        if (!setUserName.Succeeded)
            return BadRequest(new { message = "Username konnte nicht gesetzt werden.", errors = setUserName.Errors.Select(e => e.Description) });

        // optional: gleich als bestätigt markieren (du hast keine Mail-Flow)
        user.EmailConfirmed = true;
        await _um.UpdateAsync(user);

        // neues JWT mit neuer E-Mail
        var token = _jwt.Create(user.Id, user.Email!);
        return Ok(new AuthResponseDto(user.Id, user.Email!, token));
    }

    [Authorize]
    [HttpPost("delete-account")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        var user = await _um.FindByIdAsync(userId);
        if (user is null) return Unauthorized(new { message = "User nicht gefunden." });

        // Passwort bestätigen
        var pwOk = await _um.CheckPasswordAsync(user, dto.Password);
        if (!pwOk) return BadRequest(new { message = "Passwort ist falsch." });

        using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            // 1) User-Daten löschen (hier: WeightEntries)
            var weights = _db.WeightEntries.Where(w => w.UserId == userId);
            _db.WeightEntries.RemoveRange(weights);
            await _db.SaveChangesAsync();

            // TODO: Falls du später weitere “UserId”-gebundene Tabellen hast -> hier genauso löschen.

            // 2) Identity-User löschen
            var delRes = await _um.DeleteAsync(user);
            if (!delRes.Succeeded)
            {
                await tx.RollbackAsync();
                return BadRequest(new { message = "Profil löschen fehlgeschlagen.", errors = delRes.Errors.Select(e => e.Description) });
            }

            await tx.CommitAsync();
            return Ok(new { ok = true });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            return StatusCode(500, new { message = "Serverfehler beim Löschen.", detail = ex.Message });
        }
    }
}

/// <summary>DTO für Login/Register/ChangePassword Response</summary>
public record AuthResponseDto(string Id, string Email, string Token);
