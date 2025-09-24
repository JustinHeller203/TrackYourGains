using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Gym3000.Api.Data;
using Gym3000.Api.Dtos;
using Gym3000.Api.Entities;
using Gym3000.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Gym3000.Api.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
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

    // ===== Helpers =====
    private static string HashToken(string raw)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(raw));
        return Convert.ToBase64String(bytes);
    }

    private static string NewSecureToken()
    {
        Span<byte> buf = stackalloc byte[64];
        RandomNumberGenerator.Fill(buf);
        return Convert.ToBase64String(buf); // lang genug
    }

    private CookieOptions RtCookieOptions(TimeSpan life)
    {
        // Cross-site (Vercel -> Railway): SameSite=None & Secure MUSS
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTimeOffset.UtcNow.Add(life),
            Path = "/",
            // Domain = ".trackyourgains.de" // nur nötig, wenn eigene Domain für API
        };
    }

    private async Task<RefreshToken> IssueRefreshTokenAsync(IdentityUser user, TimeSpan life)
    {
        var raw = NewSecureToken();
        var rt = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = HashToken(raw),
            ExpiresAtUtc = DateTime.UtcNow.Add(life),
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString()
        };

        _db.RefreshTokens.Add(rt);
        await _db.SaveChangesAsync();

        // Cookie setzen (rohes Token, nicht den Hash)
        Response.Cookies.Append("rt", raw, RtCookieOptions(life));
        return rt;
    }

    private async Task RotateRefreshAsync(RefreshToken current, IdentityUser user, TimeSpan life)
    {
        current.RevokedAtUtc = DateTime.UtcNow;
        var raw = NewSecureToken();
        var next = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = HashToken(raw),
            ExpiresAtUtc = DateTime.UtcNow.Add(life),
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString()
        };
        _db.RefreshTokens.Add(next);
        await _db.SaveChangesAsync();
        Response.Cookies.Append("rt", raw, RtCookieOptions(life));
    }

    private async Task RevokeAllAsync(string userId)
    {
        var all = _db.RefreshTokens.Where(x => x.UserId == userId && x.RevokedAtUtc == null);
        await all.ExecuteUpdateAsync(s => s.SetProperty(x => x.RevokedAtUtc, DateTime.UtcNow));
    }

    private static TimeSpan RefreshLifetime => TimeSpan.FromDays(30);

    // ===== Token-Versionierung (tv) =====
    private async Task<int> GetTokenVersionAsync(string userId)
    {
        var meta = await _db.UserMetas.FindAsync(userId);
        if (meta is null)
        {
            meta = new UserMeta { UserId = userId, TokenVersion = 0 };
            _db.UserMetas.Add(meta);
            await _db.SaveChangesAsync();
        }
        return meta.TokenVersion;
    }

    private async Task<int> BumpTokenVersionAsync(string userId)
    {
        var meta = await _db.UserMetas.FindAsync(userId);
        if (meta is null)
        {
            meta = new UserMeta { UserId = userId, TokenVersion = 1 };
            _db.UserMetas.Add(meta);
        }
        else
        {
            meta.TokenVersion++;
        }
        await _db.SaveChangesAsync();
        return meta.TokenVersion;
    }

    // ===== Audit-Log Helper =====
    private async Task LogAuditAsync(string? userId, string action, object? meta = null)
    {
        try
        {
            _db.AuditLogs.Add(new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Action = action,
                CreatedUtc = DateTime.UtcNow,
                Ip = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = Request.Headers.UserAgent.ToString(),
                Meta = meta is null ? null : JsonSerializer.Serialize(meta)
            });
            await _db.SaveChangesAsync();
        }
        catch
        {
            // Logging soll nie Requests killen
        }
    }

    // ===== Endpoints =====

    /// <summary>Registrierung</summary>
    [HttpPost("register")]
    [EnableRateLimiting("auth")]
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
            await LogAuditAsync(null, "register_failed", new { email = dto.Email, errors = result.Errors.Select(e => e.Code) });
            return BadRequest(new { message = "Registrierung fehlgeschlagen.", errors = result.Errors.Select(e => e.Description) });
        }

        // Init Refresh & TokenVersion
        await IssueRefreshTokenAsync(user, RefreshLifetime);
        _db.UserMetas.Add(new UserMeta { UserId = user.Id, TokenVersion = 0 });
        await _db.SaveChangesAsync();

        await LogAuditAsync(user.Id, "register", new { email = user.Email });

        var tv = 0;
        var token = _jwt.Create(user.Id, user.Email!, tv);
        return Ok(new AuthResponseDto(user.Id, user.Email!, token));
    }

    /// <summary>Login</summary>
    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var user = await _um.FindByEmailAsync(dto.Email);
        if (user is null)
        {
            await LogAuditAsync(null, "login_failed", new { email = dto.Email, reason = "user_not_found" });
            return Unauthorized(new { message = "Ungültige Anmeldedaten." });
        }

        var ok = await _um.CheckPasswordAsync(user, dto.Password);
        if (!ok)
        {
            await LogAuditAsync(user.Id, "login_failed", new { email = dto.Email, reason = "bad_password" });
            return Unauthorized(new { message = "Ungültige Anmeldedaten." });
        }

        await IssueRefreshTokenAsync(user, RefreshLifetime);

        var tv = await GetTokenVersionAsync(user.Id);
        var token = _jwt.Create(user.Id, user.Email!, tv);

        await LogAuditAsync(user.Id, "login_success");
        return Ok(new AuthResponseDto(user.Id, user.Email!, token));
    }

    /// <summary>Access-Token via Refresh-Cookie rotieren</summary>
    [HttpPost("refresh")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh()
    {
        var raw = Request.Cookies["rt"];
        if (string.IsNullOrWhiteSpace(raw))
            return Unauthorized(new { message = "Kein Refresh-Cookie." });

        var hash = HashToken(raw);
        var rt = await _db.RefreshTokens.FirstOrDefaultAsync(x => x.TokenHash == hash);

        if (rt is null)
            return Unauthorized(new { message = "Ungültiger Refresh-Token." });

        // 🔒 Reuse-Detection
        if (rt.RevokedAtUtc is not null)
        {
            await RevokeAllAsync(rt.UserId);
            await LogAuditAsync(rt.UserId, "refresh_reuse_detected", new
            {
                presentedHash = hash,
                revokedAt = rt.RevokedAtUtc
            });

            Response.Cookies.Delete("rt", RtCookieOptions(TimeSpan.Zero));
            return Unauthorized(new { message = "Session ungültig. Bitte erneut einloggen." });
        }

        if (!rt.IsActive)
            return Unauthorized(new { message = "Refresh-Token inaktiv/abgelaufen." });

        var user = await _um.FindByIdAsync(rt.UserId);
        if (user is null)
            return Unauthorized(new { message = "User nicht gefunden." });

        // Rotation (wichtig gegen Replay)
        await RotateRefreshAsync(rt, user, RefreshLifetime);

        // tv NICHT bumpen, nur erneut signieren
        var tv = await GetTokenVersionAsync(user.Id);
        var token = _jwt.Create(user.Id, user.Email!, tv);

        await LogAuditAsync(user.Id, "token_refreshed");
        return Ok(new AuthResponseDto(user.Id, user.Email!, token));
    }

    /// <summary>Logout (aktuellen Refresh revoke + Cookie löschen)</summary>
    [Authorize]
    [HttpPost("logout")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var raw = Request.Cookies["rt"];
        if (!string.IsNullOrWhiteSpace(raw))
        {
            var hash = HashToken(raw);
            var rt = await _db.RefreshTokens.FirstOrDefaultAsync(x => x.TokenHash == hash);
            if (rt is not null && rt.RevokedAtUtc is null)
            {
                rt.RevokedAtUtc = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }

        Response.Cookies.Delete("rt", RtCookieOptions(TimeSpan.Zero));

        await LogAuditAsync(userId, "logout");
        return Ok(new { ok = true });
    }

    /// <summary>Passwort ändern (revoked all refresh + bump tv)</summary>
    [Authorize]
    [HttpPost("change-password")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Nicht eingeloggt." });

        var user = await _um.FindByIdAsync(userId);
        if (user is null) return Unauthorized(new { message = "User nicht gefunden." });

        var result = await _um.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
        {
            await LogAuditAsync(user.Id, "change_password_failed", new { errors = result.Errors.Select(e => e.Code) });
            return BadRequest(new { message = "Passwortänderung fehlgeschlagen.", errors = result.Errors.Select(e => e.Description) });
        }

        await RevokeAllAsync(user.Id);
        await IssueRefreshTokenAsync(user, RefreshLifetime);

        var tv = await BumpTokenVersionAsync(user.Id);
        var token = _jwt.Create(user.Id, user.Email!, tv);

        await LogAuditAsync(user.Id, "change_password_success");
        return Ok(new AuthResponseDto(user.Id, user.Email!, token));
    }

    /// <summary>E-Mail ändern (revoked all refresh + bump tv)</summary>
    [Authorize]
    [HttpPost("change-email")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Nicht eingeloggt." });

        var user = await _um.FindByIdAsync(userId);
        if (user is null) return Unauthorized(new { message = "User nicht gefunden." });

        var pwOk = await _um.CheckPasswordAsync(user, dto.Password);
        if (!pwOk)
        {
            await LogAuditAsync(user.Id, "change_email_failed", new { reason = "bad_password" });
            return BadRequest(new { message = "Passwort ist falsch." });
        }

        var exists = await _um.FindByEmailAsync(dto.NewEmail);
        if (exists is not null && exists.Id != user.Id)
        {
            await LogAuditAsync(user.Id, "change_email_failed", new { reason = "email_taken" });
            return BadRequest(new { message = "Diese E-Mail ist bereits registriert." });
        }

        var setEmail = await _um.SetEmailAsync(user, dto.NewEmail);
        if (!setEmail.Succeeded)
        {
            await LogAuditAsync(user.Id, "change_email_failed", new { reason = "set_email_failed", errors = setEmail.Errors.Select(e => e.Code) });
            return BadRequest(new { message = "E-Mail konnte nicht gesetzt werden.", errors = setEmail.Errors.Select(e => e.Description) });
        }

        var setUserName = await _um.SetUserNameAsync(user, dto.NewEmail);
        if (!setUserName.Succeeded)
        {
            await LogAuditAsync(user.Id, "change_email_failed", new { reason = "set_username_failed", errors = setUserName.Errors.Select(e => e.Code) });
            return BadRequest(new { message = "Username konnte nicht gesetzt werden.", errors = setUserName.Errors.Select(e => e.Description) });
        }

        user.EmailConfirmed = true;
        await _um.UpdateAsync(user);

        await RevokeAllAsync(user.Id);
        await IssueRefreshTokenAsync(user, RefreshLifetime);

        var tv = await BumpTokenVersionAsync(user.Id);
        var token = _jwt.Create(user.Id, user.Email!, tv);

        await LogAuditAsync(user.Id, "change_email_success", new { newEmail = user.Email });
        return Ok(new AuthResponseDto(user.Id, user.Email!, token));
    }

    /// <summary>Account + Daten löschen (revokes all)</summary>
    [Authorize]
    [HttpPost("delete-account")]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { message = "Nicht eingeloggt." });

        var user = await _um.FindByIdAsync(userId);
        if (user is null) return Unauthorized(new { message = "User nicht gefunden." });

        var pwOk = await _um.CheckPasswordAsync(user, dto.Password);
        if (!pwOk)
        {
            await LogAuditAsync(user.Id, "delete_account_failed", new { reason = "bad_password" });
            return BadRequest(new { message = "Passwort ist falsch." });
        }

        using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            // usergebundene Daten löschen
            var weights = _db.WeightEntries.Where(w => w.UserId == userId);
            _db.WeightEntries.RemoveRange(weights);

            // auch Metas & RefreshTokens killen
            var metas = await _db.UserMetas.Where(m => m.UserId == userId).ToListAsync();
            _db.UserMetas.RemoveRange(metas);

            var rts = await _db.RefreshTokens.Where(r => r.UserId == userId).ToListAsync();
            _db.RefreshTokens.RemoveRange(rts);

            await _db.SaveChangesAsync();

            var delRes = await _um.DeleteAsync(user);
            if (!delRes.Succeeded)
            {
                await tx.RollbackAsync();
                await LogAuditAsync(user.Id, "delete_account_failed", new { reason = "identity_delete_failed", errors = delRes.Errors.Select(e => e.Code) });
                return BadRequest(new { message = "Profil löschen fehlgeschlagen.", errors = delRes.Errors.Select(e => e.Description) });
            }

            await tx.CommitAsync();

            // Cookie löschen
            Response.Cookies.Delete("rt", RtCookieOptions(TimeSpan.Zero));
            await LogAuditAsync(user.Id, "delete_account_success");
            return Ok(new { ok = true });
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync();
            await LogAuditAsync(userId, "delete_account_failed", new { reason = "exception", detail = ex.Message });
            return StatusCode(500, new { message = "Serverfehler beim Löschen.", detail = ex.Message });
        }
    }

    // ===== Sessions / Geräteverwaltung =====

    /// <summary>Aktive Sessions (Refresh-Tokens) des Users anzeigen</summary>
    [Authorize]
    [HttpGet("sessions")]
    [ProducesResponseType(typeof(List<SessionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSessions()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        // aktuellen Refresh-Cookie-Hash berechnen (falls vorhanden)
        var currentRaw = Request.Cookies["rt"];
        var currentHash = string.IsNullOrEmpty(currentRaw) ? null : HashToken(currentRaw);

        var list = await _db.RefreshTokens
            .Where(r => r.UserId == userId && r.RevokedAtUtc == null)
            .OrderByDescending(r => r.ExpiresAtUtc)
            .Select(r => new SessionDto(
                r.Id.ToString(),
                r.ExpiresAtUtc,
                currentHash != null && r.TokenHash == currentHash,
                r.UserAgent,
                r.CreatedByIp
            ))
            .ToListAsync();

        await LogAuditAsync(userId, "sessions_listed", new { count = list.Count });
        return Ok(list);
    }

    /// <summary>Eine Session (Refresh-Token) widerrufen</summary>
    [Authorize]
    [HttpPost("sessions/revoke")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RevokeSession([FromBody] RevokeSessionDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        if (!Guid.TryParse(dto.Id, out var rid))
            return BadRequest(new { message = "Ungültige Session-ID." });

        var rt = await _db.RefreshTokens
            .FirstOrDefaultAsync(r => r.UserId == userId && r.Id == rid && r.RevokedAtUtc == null);

        if (rt is null)
            return NotFound(new { message = "Session nicht gefunden oder bereits widerrufen." });

        rt.RevokedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        // falls gerade die eigene aktuelle Session: Cookie killen
        var raw = Request.Cookies["rt"];
        if (!string.IsNullOrEmpty(raw) && HashToken(raw) == rt.TokenHash)
            Response.Cookies.Delete("rt", RtCookieOptions(TimeSpan.Zero));

        await LogAuditAsync(userId, "session_revoked", new { sessionId = dto.Id, self = (raw != null && HashToken(raw) == rt.TokenHash) });
        return Ok(new { ok = true });
    }
}

/// <summary>DTO für Login/Register/ChangePassword Response</summary>
public record AuthResponseDto(string Id, string Email, string Token);

// Sessions-DTOs
public record SessionDto(
    string Id,
    DateTime ExpiresAtUtc,
    bool IsCurrent,
    string? UserAgent,
    string? Ip
);

public record RevokeSessionDto(string Id);
