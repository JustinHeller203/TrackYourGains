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
[Route("api/progress")]
[Authorize]
[Produces("application/json")]
public class ProgressController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ProgressController(ApplicationDbContext db)
    {
        _db = db;
    }

    private string? GetUserId()
        => User.FindFirstValue(ClaimTypes.NameIdentifier)
           ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

    // GET /api/progress?planId=GUID
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] Guid planId)
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        if (planId == Guid.Empty)
            return BadRequest(new { message = "planId fehlt." });

        var rows = await _db.ProgressEntries
            .AsNoTracking()
            .Where(x => x.UserId == userId && x.PlanId == planId)
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.Id)
            .Select(x => new ProgressEntryDto(
                x.Id,
                x.PlanId,
                x.Date,
                x.Exercise,
                x.Type,
                x.Sets,
                x.Reps,
                x.WeightKg,
                x.DurationMin,
                x.DistanceKm,
                x.Note,
                x.Tempo,
                x.RestSeconds
            ))
            .ToListAsync();

        return Ok(rows);
    }

    // POST /api/progress
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProgressEntryDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        // Ownership check: Plan muss dem User gehören
        var planOk = await _db.TrainingPlans.AnyAsync(p => p.Id == dto.PlanId && p.UserId == userId);
        if (!planOk)
            return NotFound(new { message = "Plan nicht gefunden." });

        var entry = new ProgressEntry
        {
            UserId = userId,
            PlanId = dto.PlanId,

            // nur Datum ohne Uhrzeit speichern
            Date = dto.Date.Date,

            Exercise = dto.Exercise.Trim(),
            Type = dto.Type,

            Sets = dto.Sets,
            Reps = dto.Reps,
            WeightKg = dto.WeightKg,

            DurationMin = dto.DurationMin,
            DistanceKm = dto.DistanceKm,

            Note = string.IsNullOrWhiteSpace(dto.Note) ? null : dto.Note.Trim(),
            Tempo = string.IsNullOrWhiteSpace(dto.Tempo) ? null : dto.Tempo.Trim(),
            RestSeconds = dto.RestSeconds
        };

        _db.ProgressEntries.Add(entry);
        await _db.SaveChangesAsync();

        return Ok(new ProgressEntryDto(
            entry.Id,
            entry.PlanId,
            entry.Date,
            entry.Exercise,
            entry.Type,
            entry.Sets,
            entry.Reps,
            entry.WeightKg,
            entry.DurationMin,
            entry.DistanceKm,
            entry.Note,
            entry.Tempo,
            entry.RestSeconds
        ));
    }

    // PUT /api/progress/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateProgressEntryDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        var entry = await _db.ProgressEntries.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (entry is null)
            return NotFound(new { message = "Eintrag nicht gefunden." });

        entry.Date = dto.Date.Date;
        entry.Exercise = dto.Exercise.Trim();
        entry.Type = dto.Type;

        entry.Sets = dto.Sets;
        entry.Reps = dto.Reps;
        entry.WeightKg = dto.WeightKg;

        entry.DurationMin = dto.DurationMin;
        entry.DistanceKm = dto.DistanceKm;

        entry.Note = string.IsNullOrWhiteSpace(dto.Note) ? null : dto.Note.Trim();
        entry.Tempo = string.IsNullOrWhiteSpace(dto.Tempo) ? null : dto.Tempo.Trim();
        entry.RestSeconds = dto.RestSeconds;

        await _db.SaveChangesAsync();

        return Ok(new ProgressEntryDto(
            entry.Id,
            entry.PlanId,
            entry.Date,
            entry.Exercise,
            entry.Type,
            entry.Sets,
            entry.Reps,
            entry.WeightKg,
            entry.DurationMin,
            entry.DistanceKm,
            entry.Note,
            entry.Tempo,
            entry.RestSeconds
        ));
    }

    // DELETE /api/progress/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        var entry = await _db.ProgressEntries.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (entry is null)
            return NotFound(new { message = "Eintrag nicht gefunden." });

        _db.ProgressEntries.Remove(entry);
        await _db.SaveChangesAsync();

        return Ok(new { ok = true });
    }
}
