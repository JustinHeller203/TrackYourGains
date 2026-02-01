using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Gym3000.Api.Data;
using Gym3000.Api.Dtos.Time;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using StopwatchEntity = Gym3000.Api.Entities.Time.Stopwatch;

namespace Gym3000.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/stopwatches")]
[Produces("application/json")]
public class StopwatchesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public StopwatchesController(ApplicationDbContext db)
    {
        _db = db;
    }

    private string? GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

    private static StopwatchDto ToDto(StopwatchEntity s) => new(
        s.Id,
        s.Name,
        s.ElapsedMs,
        s.IsRunning,
        s.StartedAtUtc,
        s.IsVisible,
        s.ShouldStaySticky,
        s.SortIndex,
        s.CreatedUtc,
        s.UpdatedUtc
    );

    private static long ClampElapsed(long v) => v < 0 ? 0 : v;

    [HttpGet]
    public async Task<ActionResult<List<StopwatchDto>>> List()
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var list = await _db.Stopwatches
            .Where(s => s.UserId == userId)
            .OrderBy(s => s.SortIndex)
            .Select(s => ToDto(s))
            .ToListAsync();

        // Seed: mindestens 1 Stoppuhr
        if (list.Count == 0)
        {
            var seed = new StopwatchEntity
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Name = "Stoppuhr",
                ElapsedMs = 0,
                IsRunning = false,
                StartedAtUtc = null,
                IsVisible = true,
                ShouldStaySticky = false,
                SortIndex = 0,
                CreatedUtc = DateTime.UtcNow,
                UpdatedUtc = DateTime.UtcNow
            };

            _db.Stopwatches.Add(seed);
            await _db.SaveChangesAsync();

            list.Add(ToDto(seed));
        }

        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<StopwatchDto>> Create([FromBody] UpsertStopwatchDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var maxIndex = await _db.Stopwatches
            .Where(s => s.UserId == userId)
            .Select(s => (int?)s.SortIndex)
            .MaxAsync() ?? -1;

        var name = string.IsNullOrWhiteSpace(dto.Name) ? "Stoppuhr" : dto.Name.Trim();

        var sw = new StopwatchEntity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name,
            ElapsedMs = ClampElapsed(dto.ElapsedMs ?? 0),
            IsRunning = dto.IsRunning ?? false,
            StartedAtUtc = dto.IsRunning == true ? (dto.StartedAtUtc ?? DateTime.UtcNow) : null,
            IsVisible = dto.IsVisible ?? true,
            ShouldStaySticky = dto.ShouldStaySticky ?? false,
            SortIndex = maxIndex + 1,
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow
        };

        _db.Stopwatches.Add(sw);
        await _db.SaveChangesAsync();

        return Ok(ToDto(sw));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertStopwatchDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var sw = await _db.Stopwatches.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
        if (sw is null) return NotFound(new { message = "Stoppuhr nicht gefunden." });

        if (dto.Name != null)
            sw.Name = string.IsNullOrWhiteSpace(dto.Name) ? sw.Name : dto.Name.Trim();

        if (dto.ElapsedMs.HasValue)
            sw.ElapsedMs = ClampElapsed(dto.ElapsedMs.Value);

        if (dto.IsVisible.HasValue) sw.IsVisible = dto.IsVisible.Value;
        if (dto.ShouldStaySticky.HasValue) sw.ShouldStaySticky = dto.ShouldStaySticky.Value;

        // Running-State konsistent halten
        if (dto.IsRunning.HasValue)
        {
            sw.IsRunning = dto.IsRunning.Value;
            if (sw.IsRunning)
            {
                sw.StartedAtUtc = dto.StartedAtUtc ?? sw.StartedAtUtc ?? DateTime.UtcNow;
            }
            else
            {
                sw.StartedAtUtc = null;
            }
        }
        else if (dto.StartedAtUtc.HasValue)
        {
            // StartedAt alleine updaten nur sinnvoll wenn running
            if (sw.IsRunning) sw.StartedAtUtc = dto.StartedAtUtc.Value;
        }

        sw.UpdatedUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var sw = await _db.Stopwatches.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
        if (sw is null) return NotFound(new { message = "Stoppuhr nicht gefunden." });

        var count = await _db.Stopwatches.CountAsync(s => s.UserId == userId);
        if (count <= 1) return BadRequest(new { message = "Mindestens eine Stoppuhr muss bleiben." });

        _db.Stopwatches.Remove(sw);
        await _db.SaveChangesAsync();

        return Ok(new { ok = true });
    }

    [HttpPut("reorder")]
    public async Task<IActionResult> Reorder([FromBody] ReorderStopwatchesDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        if (dto.OrderedIds is null || dto.OrderedIds.Length == 0)
            return BadRequest(new { message = "OrderedIds fehlt." });

        var sws = await _db.Stopwatches
            .Where(s => s.UserId == userId && dto.OrderedIds.Contains(s.Id))
            .ToListAsync();

        if (sws.Count != dto.OrderedIds.Length)
            return BadRequest(new { message = "IDs passen nicht zu deinen Stopuhren." });

        for (int i = 0; i < dto.OrderedIds.Length; i++)
        {
            var id = dto.OrderedIds[i];
            var s = sws.First(x => x.Id == id);
            s.SortIndex = i;
            s.UpdatedUtc = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }
}
