//Controllers/TimersController.cs

using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Gym3000.Api.Data;
using Gym3000.Api.Dtos.Timers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using TimerEntity = Gym3000.Api.Entities.Time.Timer;

namespace Gym3000.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/timers")]
[Produces("application/json")]
public class TimersController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public TimersController(ApplicationDbContext db)
    {
        _db = db;
    }

    private string? GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

    private static string NormalizePreset(string? preset)
    {
        var p = (preset ?? "").Trim().ToLowerInvariant();
        return p switch
        {
            "60" => "60",
            "90" => "90",
            "120" => "120",
            "custom" => "custom",
            _ => "60"
        };
    }

    private static int? NormalizeCustom(string preset, int? customSeconds)
    {
        if (preset != "custom") return null;
        if (!customSeconds.HasValue) return null;
        return customSeconds.Value < 1 ? 1 : customSeconds.Value;
    }

    private static TimerDto ToDto(TimerEntity t) => new(
            t.Id,
        t.Name,
        t.SecondsPreset,
        t.CustomSeconds,
        t.Sound,
        t.IsFavorite,
        t.IsVisible,
        t.ShouldStaySticky,
        t.SortIndex,
        t.CreatedUtc,
        t.UpdatedUtc
    );

    [HttpGet]
    public async Task<ActionResult<List<TimerDto>>> List()
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var timers = await _db.Timers
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.IsFavorite)
            .ThenBy(t => t.SortIndex)
            .Select(t => ToDto(t))
            .ToListAsync();

        // Seed: falls der User noch keinen Timer hat -> einen anlegen
        if (timers.Count == 0)
        {
            var seed = new TimerEntity
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Name = "Timer",
                SecondsPreset = "60",
                CustomSeconds = null,
                Sound = "standard",
                IsFavorite = false,
                IsVisible = true,
                ShouldStaySticky = false,
                SortIndex = 0,
                CreatedUtc = DateTime.UtcNow,
                UpdatedUtc = DateTime.UtcNow
            };

            _db.Timers.Add(seed);
            await _db.SaveChangesAsync();

            timers.Add(ToDto(seed));
        }

        return Ok(timers);
    }

    [HttpPost]
    public async Task<ActionResult<TimerDto>> Create([FromBody] UpsertTimerDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var maxIndex = await _db.Timers
            .Where(t => t.UserId == userId)
            .Select(t => (int?)t.SortIndex)
            .MaxAsync() ?? -1;

        var preset = NormalizePreset(dto.SecondsPreset);
        var timer = new TimerEntity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = string.IsNullOrWhiteSpace(dto.Name) ? "Timer" : dto.Name.Trim(),
            SecondsPreset = preset,
            CustomSeconds = NormalizeCustom(preset, dto.CustomSeconds),
            Sound = string.IsNullOrWhiteSpace(dto.Sound) ? "standard" : dto.Sound.Trim(),
            IsFavorite = dto.IsFavorite ?? false,
            IsVisible = dto.IsVisible ?? true,
            ShouldStaySticky = dto.ShouldStaySticky ?? false,
            SortIndex = maxIndex + 1,
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        };

        _db.Timers.Add(timer);
        await _db.SaveChangesAsync();

        return Ok(ToDto(timer));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertTimerDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var timer = await _db.Timers.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (timer is null) return NotFound(new { message = "Timer nicht gefunden." });

        if (dto.Name != null)
            timer.Name = string.IsNullOrWhiteSpace(dto.Name) ? "Timer" : dto.Name.Trim();

        if (dto.Sound != null)
            timer.Sound = string.IsNullOrWhiteSpace(dto.Sound) ? timer.Sound : dto.Sound.Trim();

        if (dto.SecondsPreset != null)
            timer.SecondsPreset = NormalizePreset(dto.SecondsPreset);

        if (dto.CustomSeconds != null || dto.SecondsPreset != null)
            timer.CustomSeconds = NormalizeCustom(timer.SecondsPreset, dto.CustomSeconds ?? timer.CustomSeconds);

        if (dto.IsFavorite.HasValue) timer.IsFavorite = dto.IsFavorite.Value;
        if (dto.IsVisible.HasValue) timer.IsVisible = dto.IsVisible.Value;
        if (dto.ShouldStaySticky.HasValue) timer.ShouldStaySticky = dto.ShouldStaySticky.Value;

        timer.UpdatedUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var timer = await _db.Timers.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (timer is null) return NotFound(new { message = "Timer nicht gefunden." });

        // Safety: mindestens 1 Timer behalten (wie dein Frontend)
        var count = await _db.Timers.CountAsync(t => t.UserId == userId);
        if (count <= 1) return BadRequest(new { message = "Mindestens ein Timer muss bleiben." });

        _db.Timers.Remove(timer);
        await _db.SaveChangesAsync();

        return Ok(new { ok = true });
    }

    [HttpPut("reorder")]
    public async Task<IActionResult> Reorder([FromBody] ReorderTimersDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        if (dto.OrderedIds is null || dto.OrderedIds.Length == 0)
            return BadRequest(new { message = "OrderedIds fehlt." });

        var timers = await _db.Timers
            .Where(t => t.UserId == userId && dto.OrderedIds.Contains(t.Id))
            .ToListAsync();

        if (timers.Count != dto.OrderedIds.Length)
            return BadRequest(new { message = "IDs passen nicht zu deinen Timern." });

        for (int i = 0; i < dto.OrderedIds.Length; i++)
        {
            var id = dto.OrderedIds[i];
            var t = timers.First(x => x.Id == id);
            t.SortIndex = i;
            t.UpdatedUtc = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }
}
