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

    private static string GetPepper() =>
    Environment.GetEnvironmentVariable("REFRESH_TOKEN_PEPPER") ?? "";

    private static string NewSalt()
    {
        Span<byte> buf = stackalloc byte[16];
        RandomNumberGenerator.Fill(buf);
        return Convert.ToBase64String(buf); // <=64 Zeichen → passt zu MaxLength(64)
    }

    private static string HashToken(string raw, string salt)
    {
        using var sha = SHA256.Create();
        var combined = Encoding.UTF8.GetBytes(raw + "|" + salt + "|" + GetPepper());
        var bytes = sha.ComputeHash(combined);
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
            Path = "/"
        };
    }

    private static TimeSpan RefreshLifetime => TimeSpan.FromDays(30);

    // ===== RefreshToken-Ausgabe & Rotation =====

    private async Task<RefreshToken> IssueRefreshTokenAsync(IdentityUser user, TimeSpan life)
    {
        var raw = NewSecureToken();
        var salt = NewSalt();
        var fam = Guid.NewGuid().ToString("N"); // <- STRING! (ohne Bindestriche)

        var rt = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = HashToken(raw, salt),
            Salt = salt,
            ExpiresAtUtc = DateTime.UtcNow.Add(life),
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString(),
            FamilyId = fam,          // <- MUSS gesetzt sein (string, NOT NULL)
            IsCurrent = true
        };

        // DEBUG: sofort prüfen, was wir speichern
        Console.WriteLine($"[RT-ISSUE] user={user.Id} fam={rt.FamilyId} salt.len={rt.Salt?.Length} hash.len={rt.TokenHash?.Length}");

        _db.RefreshTokens.Add(rt);
        await _db.SaveChangesAsync();

        Response.Cookies.Append("rt", raw, RtCookieOptions(life));
        return rt;
    }

    private async Task RotateRefreshAsync(RefreshToken current, IdentityUser user, TimeSpan life)
    {
        current.RevokedAtUtc = DateTime.UtcNow;
        current.IsCurrent = false;

        var raw = NewSecureToken();
        var salt = NewSalt();
        var fam = string.IsNullOrEmpty(current.FamilyId) ? Guid.NewGuid().ToString("N") : current.FamilyId;

        var next = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = HashToken(raw, salt),
            Salt = salt,
            ExpiresAtUtc = DateTime.UtcNow.Add(life),
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString(),
            FamilyId = fam,          // <- in derselben Familie bleiben
            IsCurrent = true
        };

        Console.WriteLine($"[RT-ROTATE] user={user.Id} fam={next.FamilyId} salt.len={next.Salt?.Length}");

        _db.RefreshTokens.Add(next);
        await _db.SaveChangesAsync();

        Response.Cookies.Append("rt", raw, RtCookieOptions(life));
    }


    private async Task RevokeAllAsync(string userId)
    {
        var all = _db.RefreshTokens.Where(x => x.UserId == userId && x.RevokedAtUtc == null);
        await all.ExecuteUpdateAsync(s => s.SetProperty(x => x.RevokedAtUtc, DateTime.UtcNow)
                                           .SetProperty(x => x.IsCurrent, false));
    }

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

    [HttpPost("register")]
    [EnableRateLimiting("auth")]
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

        await IssueRefreshTokenAsync(user, RefreshLifetime);
        _db.UserMetas.Add(new UserMeta { UserId = user.Id, TokenVersion = 0 });
        await _db.SaveChangesAsync();

        await LogAuditAsync(user.Id, "register", new { email = user.Email });

        var token = _jwt.Create(user.Id, user.Email!, 0);
        return Ok(new AuthResponseDto(user.Id, user.Email!, token));
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
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

    [HttpPost("refresh")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Refresh()
    {
        var raw = Request.Cookies["rt"];
        if (string.IsNullOrWhiteSpace(raw))
            return Unauthorized(new { message = "Kein Refresh-Cookie." });

        // Kandidaten holen (nicht-revoked & aktuell)
        var candidates = await _db.RefreshTokens
    .Where(x => x.RevokedAtUtc == null && x.IsCurrent)
    .OrderByDescending(x => x.ExpiresAtUtc)
    .ToListAsync();

        var rt = candidates.FirstOrDefault(x => HashToken(raw, x.Salt) == x.TokenHash);
        if (rt is null) return Unauthorized(new { message = "Ungültiger Refresh-Token." });

        if (!rt.IsActive)
            return Unauthorized(new { message = "Refresh-Token inaktiv/abgelaufen." });

        var user = await _um.FindByIdAsync(rt.UserId);
        if (user is null)
            return Unauthorized(new { message = "User nicht gefunden." });

        await RotateRefreshAsync(rt, user, RefreshLifetime);

        var tv = await GetTokenVersionAsync(user.Id);
        var token = _jwt.Create(user.Id, user.Email!, tv);

        await LogAuditAsync(user.Id, "token_refreshed");
        return Ok(new AuthResponseDto(user.Id, user.Email!, token));
    }

    [Authorize]
    [HttpPost("logout")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var raw = Request.Cookies["rt"];
        if (!string.IsNullOrWhiteSpace(raw))
        {
            var tokens = await _db.RefreshTokens.Where(t => t.RevokedAtUtc == null && t.IsCurrent).ToListAsync();
            var rt = tokens.FirstOrDefault(x => HashToken(raw, x.Salt) == x.TokenHash);
            if (rt is not null)
            {
                rt.RevokedAtUtc = DateTime.UtcNow;
                rt.IsCurrent = false;
                await _db.SaveChangesAsync();
            }
        }

        Response.Cookies.Delete("rt", RtCookieOptions(TimeSpan.Zero));

        await LogAuditAsync(userId, "logout");
        return Ok(new { ok = true });
    }

    [Authorize]
    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        // rohes Cookie (kann null sein)
        var currentRaw = Request.Cookies["rt"];

        // Wir brauchen Salt für den Vergleich -> zuerst materialisieren
        var rows = await _db.RefreshTokens
            .Where(r => r.UserId == userId && r.RevokedAtUtc == null)
            .OrderByDescending(r => r.ExpiresAtUtc)
            .ToListAsync();

        // IsCurrent korrekt bestimmen: Hash(raw, r.Salt) == r.TokenHash
        var list = rows.Select(r => new SessionDto(
            r.Id.ToString(),
            r.ExpiresAtUtc,
            !string.IsNullOrEmpty(currentRaw) && HashToken(currentRaw!, r.Salt) == r.TokenHash,
            r.UserAgent,
            r.CreatedByIp
        )).ToList();

        await LogAuditAsync(userId, "sessions_listed", new { count = list.Count });
        return Ok(list);
    }


    [Authorize]
    [HttpPost("sessions/revoke")]
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
        rt.IsCurrent = false;
        await _db.SaveChangesAsync();

        var raw = Request.Cookies["rt"];
        if (!string.IsNullOrEmpty(raw) && HashToken(raw, rt.Salt) == rt.TokenHash)
            Response.Cookies.Delete("rt", RtCookieOptions(TimeSpan.Zero));

        await LogAuditAsync(userId, "session_revoked",
            new { sessionId = dto.Id, self = (!string.IsNullOrEmpty(raw) && HashToken(raw, rt.Salt) == rt.TokenHash) });

        return Ok(new { ok = true });
    }
}

// ===== DTOs =====
public record AuthResponseDto(string Id, string Email, string Token);

public record SessionDto(
    string Id,
    DateTime ExpiresAtUtc,
    bool IsCurrent,
    string? UserAgent,
    string? Ip
);

public record RevokeSessionDto(string Id);
