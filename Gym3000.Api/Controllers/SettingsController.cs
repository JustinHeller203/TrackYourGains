using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Gym3000.Api.Data;
using Gym3000.Api.Dtos;
using Gym3000.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Gym3000.Api.Controllers;

[ApiController]
[Route("api/settings")]
[Produces("application/json")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public SettingsController(ApplicationDbContext db)
    {
        _db = db;
    }

    private const string DefaultToastTypesJson =
    "{\"toast-default\":true,\"toast-save\":true,\"toast-add\":true,\"toast-delete\":true,\"toast-timer\":true,\"toast-reset\":true}";

    [HttpGet]
    public async Task<ActionResult<SettingsDto>> Get()
    {
        var userId = GetUserIdOrThrow();

        var s = await _db.UserSettings
    .FirstOrDefaultAsync(x => x.UserId == userId);

        if (s is null)
        {
            // ✅ bei erstem Login direkt persistieren
            s = new UserSettings
            {
                UserId = userId,
                Theme = "dark",
                PreferredUnit = "kg",
                AutoCalcEnabled = false,
                ConfirmDeleteEnabled = true,
                BackToTopEnabled = false,
                StickyTimerEnabled = true,
                StickyStopwatchEnabled = true,
                ToastsEnabled = true,
                ToastDurationMs = 2500,
                ToastTypeEnabledJson = DefaultToastTypesJson,
                UpdatedUtc = DateTime.UtcNow
            };

            _db.UserSettings.Add(s);
            await _db.SaveChangesAsync();
        }

        return Ok(new SettingsDto
        {
            Theme = s.Theme,
            PreferredUnit = s.PreferredUnit,
            AutoCalcEnabled = s.AutoCalcEnabled,
            ConfirmDeleteEnabled = s.ConfirmDeleteEnabled,
            BackToTopEnabled = s.BackToTopEnabled,
            StickyTimerEnabled = s.StickyTimerEnabled,
            StickyStopwatchEnabled = s.StickyStopwatchEnabled,
            ToastsEnabled = s.ToastsEnabled,
            ToastDurationMs = s.ToastDurationMs,
            ToastTypeEnabledJson = string.IsNullOrWhiteSpace(s.ToastTypeEnabledJson)
    ? DefaultToastTypesJson
    : s.ToastTypeEnabledJson
        });
    }

    [HttpPut]
    public async Task<IActionResult> Put([FromBody] SettingsDto dto)
    {
        var userId = GetUserIdOrThrow();

        // --- sanitize ---
        dto.Theme = (dto.Theme ?? "dark").Trim().ToLowerInvariant();
        if (dto.Theme != "light" && dto.Theme != "dark") dto.Theme = "dark";

        dto.PreferredUnit = (dto.PreferredUnit ?? "kg").Trim().ToLowerInvariant();
        if (dto.PreferredUnit != "kg" && dto.PreferredUnit != "lbs") dto.PreferredUnit = "kg";

        if (dto.ToastDurationMs <= 0) dto.ToastDurationMs = 2500;
        dto.ToastTypeEnabledJson = string.IsNullOrWhiteSpace(dto.ToastTypeEnabledJson)
    ? DefaultToastTypesJson
    : dto.ToastTypeEnabledJson;


        var s = await _db.UserSettings.FirstOrDefaultAsync(x => x.UserId == userId);

        if (s is null)
        {
            s = new UserSettings { UserId = userId };
            _db.UserSettings.Add(s);
        }

        s.Theme = dto.Theme;
        s.PreferredUnit = dto.PreferredUnit;

        s.AutoCalcEnabled = dto.AutoCalcEnabled;
        s.ConfirmDeleteEnabled = dto.ConfirmDeleteEnabled;
        s.BackToTopEnabled = dto.BackToTopEnabled;
        s.StickyTimerEnabled = dto.StickyTimerEnabled;
        s.StickyStopwatchEnabled = dto.StickyStopwatchEnabled;

        s.ToastsEnabled = dto.ToastsEnabled;
        s.ToastDurationMs = dto.ToastDurationMs;
        s.ToastTypeEnabledJson = dto.ToastTypeEnabledJson;

        s.UpdatedUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    private string GetUserIdOrThrow()
    {
        // bei dir ist NameClaimType = sub, aber wir sind robust wie in deinem AuthController
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (string.IsNullOrWhiteSpace(userId))
            throw new UnauthorizedAccessException("Nicht eingeloggt.");

        return userId;
    }
}
