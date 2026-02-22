//TrainingPlansController.cs

using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Gym3000.Api.Data;
using Gym3000.Api.Dtos.Training;
using Gym3000.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace Gym3000.Api.Controllers;

[ApiController]
[Route("api/training-plans")]
[Produces("application/json")]
[Authorize]
public class TrainingPlansController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public TrainingPlansController(ApplicationDbContext db)
    {
        _db = db;
    }

    private string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? throw new UnauthorizedAccessException("Kein UserId-Claim gefunden.");
    }

    private const int PLAN_CODE_LEN = 12;

    private const string CODE_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private const string CODE_LOWER = "abcdefghijkmnpqrstuvwxyz";
    private const string CODE_DIGIT = "23456789";

    // nur diese Sonderzeichen erlauben:
    private const string CODE_SPECIAL = "&-_,#.";

    // für “normale” Füllzeichen: KEINE Specials
    private const string CODE_ALNUM = CODE_UPPER + CODE_LOWER + CODE_DIGIT;
    private const string CODE_ALL = CODE_ALNUM + CODE_SPECIAL;

    private static string GeneratePlanCode()
    {
        // garantiert: mind. 1 upper, 1 lower, 1 digit, GENAU 1 special
        var chars = new List<char>(PLAN_CODE_LEN)
    {
        CODE_UPPER[RandomNumberGenerator.GetInt32(CODE_UPPER.Length)],
        CODE_LOWER[RandomNumberGenerator.GetInt32(CODE_LOWER.Length)],
        CODE_DIGIT[RandomNumberGenerator.GetInt32(CODE_DIGIT.Length)],
        CODE_SPECIAL[RandomNumberGenerator.GetInt32(CODE_SPECIAL.Length)],
    };

        // Rest nur alnum, damit maximal 1 Special drin ist
        while (chars.Count < PLAN_CODE_LEN)
            chars.Add(CODE_ALNUM[RandomNumberGenerator.GetInt32(CODE_ALNUM.Length)]);

        // shuffle
        for (int i = chars.Count - 1; i > 0; i--)
        {
            int j = RandomNumberGenerator.GetInt32(i + 1);
            (chars[i], chars[j]) = (chars[j], chars[i]);
        }

        return new string(chars.ToArray());
    }

    private static bool IsValidPlanCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code)) return false;

        var trimmed = code.Trim();
        if (trimmed.Length != PLAN_CODE_LEN) return false;

        bool hasU = trimmed.Any(c => CODE_UPPER.Contains(c));
        bool hasL = trimmed.Any(c => CODE_LOWER.Contains(c));
        bool hasD = trimmed.Any(c => CODE_DIGIT.Contains(c));

        int specialCount = trimmed.Count(c => CODE_SPECIAL.Contains(c));
        bool allOk = trimmed.All(c => CODE_ALL.Contains(c));

        // GENAU 1 Special (so wie du’s willst)
        return hasU && hasL && hasD && specialCount == 1 && allOk;
    }

    private async Task<string> GetUniquePlanCodeAsync(string? preferred = null)
    {
        if (!string.IsNullOrWhiteSpace(preferred))
        {
            var trimmed = preferred.Trim();
            if (IsValidPlanCode(trimmed))
            {
                var exists = await _db.TrainingPlans.AnyAsync(p => p.Code == trimmed);
                if (!exists) return trimmed;
            }
        }

        // fallback: generate + retry
        for (int i = 0; i < 25; i++)
        {
            var code = GeneratePlanCode();
            var exists = await _db.TrainingPlans.AnyAsync(p => p.Code == code);
            if (!exists) return code;
        }

        throw new InvalidOperationException("Konnte keinen eindeutigen Plan-Code erzeugen.");
    }

    // GET: /api/training-plans
    [HttpGet]
    public async Task<ActionResult<List<TrainingPlanListItemDto>>> GetMine()
    {
        var userId = GetUserId();

        var items = await _db.TrainingPlans
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.UpdatedUtc)
            .Select(p => new TrainingPlanListItemDto(
    p.Id,
    p.Name,
    p.IsFavorite,
    p.Color,
    p.Code,
    p.Days.SelectMany(d => d.Exercises).Count(),
    p.CreatedUtc,
    p.UpdatedUtc
))
            .ToListAsync();

        return Ok(items);
    }

    // GET: /api/training-plans/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TrainingPlanDto>> GetOne(Guid id)
    {
        var userId = GetUserId();

        var plan = await _db.TrainingPlans
            .Include(p => p.Days.OrderBy(d => d.SortOrder))
                .ThenInclude(d => d.Exercises.OrderBy(x => x.SortOrder))
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (plan is null) return NotFound();

        return Ok(TrainingPlanDto.FromEntity(plan));
    }

    [AllowAnonymous]
    [HttpGet("by-code/{code}")]
    public async Task<ActionResult<TrainingPlanDto>> GetByCode(string code)
    {
        var trimmed = (code ?? "").Trim();
        if (!IsValidPlanCode(trimmed))
            return BadRequest(new { message = "Ungültiger Code." });

        var plan = await _db.TrainingPlans
            .AsNoTracking()
            .Include(p => p.Days.OrderBy(d => d.SortOrder))
                .ThenInclude(d => d.Exercises.OrderBy(x => x.SortOrder))
            .FirstOrDefaultAsync(p => p.Code == trimmed);

        if (plan is null) return NotFound(new { message = "Plan nicht gefunden." });

        return Ok(TrainingPlanDto.FromEntity(plan));
    }

    [HttpPost("install/{code}")]
    public async Task<ActionResult<TrainingPlanDto>> InstallByCode(string code)
    {
        var userId = GetUserId();

        var trimmed = (code ?? "").Trim();
        if (!IsValidPlanCode(trimmed))
            return BadRequest(new { message = "Ungültiger Code." });

        var source = await _db.TrainingPlans
            .Include(p => p.Days.OrderBy(d => d.SortOrder))
                .ThenInclude(d => d.Exercises.OrderBy(x => x.SortOrder))
            .FirstOrDefaultAsync(p => p.Code == trimmed);

        if (source is null)
            return NotFound(new { message = "Plan nicht gefunden." });

        if (source.UserId == userId)
            return BadRequest(new { message = "Das ist bereits dein Plan." });

        var now = DateTime.UtcNow;

        var cloned = new TrainingPlan
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = source.Name,
            IsFavorite = false,
            Code = await GetUniquePlanCodeAsync(null),
            CreatedUtc = now,
            UpdatedUtc = now,
            Days = source.Days
                .OrderBy(d => d.SortOrder)
                .Select(d => new TrainingDay
                {
                    Id = Guid.NewGuid(),
                    Name = d.Name,
                    SortOrder = d.SortOrder,
                    Exercises = d.Exercises
                        .OrderBy(x => x.SortOrder)
                        .Select(x => new TrainingExercise
                        {
                            Id = Guid.NewGuid(),
                            Name = x.Name,
                            Category = x.Category,
                            SortOrder = x.SortOrder,
                            Sets = x.Sets,
                            Reps = x.Reps,
                            TargetWeight = x.TargetWeight,
                            RestSeconds = x.RestSeconds,
                            DurationMin = x.DurationMin,
                            DistanceKm = x.DistanceKm,
                            Notes = x.Notes
                        }).ToList()
                }).ToList()
        };

        _db.TrainingPlans.Add(cloned);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOne), new { id = cloned.Id }, TrainingPlanDto.FromEntity(cloned));
    }

    // POST: /api/training-plans
    [HttpPost]
    public async Task<ActionResult<TrainingPlanDto>> Create([FromBody] UpsertTrainingPlanDto dto)
    {
        var userId = GetUserId();

        var now = DateTime.UtcNow;
        var name = dto.Name.Trim();

        // ✅ Unique-Name pro User (saubere 409 statt 500)
        var nameExists = await _db.TrainingPlans
            .AnyAsync(p => p.UserId == userId && p.Name == name);
        if (nameExists)
            return Conflict(new { message = "Du hast bereits einen Trainingsplan mit diesem Namen." });

        var plan = new TrainingPlan
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name,
            IsFavorite = dto.IsFavorite,
            Code = await GetUniquePlanCodeAsync(dto.Code),
            CreatedUtc = now,
            UpdatedUtc = now,
            Days = dto.Days
                .Select(d => new TrainingDay
                {
                    Id = Guid.NewGuid(),
                    Name = d.Name.Trim(),
                    SortOrder = d.SortOrder,
                    Exercises = d.Exercises.Select(x => new TrainingExercise
                    {
                        Id = Guid.NewGuid(),
                        Name = x.Name.Trim(),
                        Category = x.Category,
                        SortOrder = x.SortOrder,
                        Sets = x.Sets,
                        Reps = x.Reps,
                        TargetWeight = x.TargetWeight,
                        RestSeconds = x.RestSeconds,
                        DurationMin = x.DurationMin,
                        DistanceKm = x.DistanceKm,
                        Notes = string.IsNullOrWhiteSpace(x.Notes) ? null : x.Notes.Trim()
                    }).ToList()
                })
                .ToList()
        };

        _db.TrainingPlans.Add(plan);

        // ✅ UserMeta-Flag setzen: Plan wurde selbst erstellt
        var meta = await _db.UserMetas.FirstOrDefaultAsync(x => x.UserId == userId);
        if (meta is null)
        {
            meta = new UserMeta { UserId = userId, TokenVersion = 0, HasCreatedTrainingPlan = true };
            _db.UserMetas.Add(meta);
        }
        else
        {
            meta.HasCreatedTrainingPlan = true;
        }

        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOne), new { id = plan.Id }, TrainingPlanDto.FromEntity(plan));
    }

    // PUT: /api/training-plans/{id}
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TrainingPlanDto>> Update(
        Guid id,
        [FromBody] UpsertTrainingPlanDto dto)
    {
        var userId = GetUserId();
        var now = DateTime.UtcNow;

        dto = dto with { Code = null };

        var newName = dto.Name.Trim();

        // 1) Header direkt in der DB updaten (kein Tracking / kein Concurrency-Knall)
        var updatedRows = await _db.TrainingPlans
            .Where(p => p.Id == id && p.UserId == userId)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(p => p.Name, newName)
                .SetProperty(p => p.IsFavorite, dto.IsFavorite)
                .SetProperty(p => p.UpdatedUtc, now)
            );

        if (updatedRows == 0)
            return NotFound();

        // 2) Alle Days löschen (Exercises kommen per Cascade mit)
        await _db.TrainingDays
            .Where(d => d.PlanId == id)
            .ExecuteDeleteAsync();

        // 3) Neu anlegen (nur Inserts, kein Mischen mit alten Entities)
        var newDays = dto.Days.Select(d => new TrainingDay
        {
            Id = Guid.NewGuid(),
            PlanId = id,
            Name = d.Name.Trim(),
            SortOrder = d.SortOrder,
            Exercises = d.Exercises.Select(x => new TrainingExercise
            {
                Id = Guid.NewGuid(),
                Name = x.Name.Trim(),
                Category = x.Category,
                SortOrder = x.SortOrder,
                Sets = x.Sets,
                Reps = x.Reps,
                TargetWeight = x.TargetWeight,
                RestSeconds = x.RestSeconds,
                DurationMin = x.DurationMin,
                DistanceKm = x.DistanceKm,
                Notes = string.IsNullOrWhiteSpace(x.Notes) ? null : x.Notes.Trim()
            }).ToList()
        }).ToList();

        _db.TrainingDays.AddRange(newDays);
        await _db.SaveChangesAsync();

        // 4) frisch laden für Response
        var plan = await _db.TrainingPlans
            .Include(p => p.Days.OrderBy(d => d.SortOrder))
                .ThenInclude(d => d.Exercises.OrderBy(x => x.SortOrder))
            .FirstAsync(p => p.Id == id && p.UserId == userId);

        return Ok(TrainingPlanDto.FromEntity(plan));
    }

    // PUT: /api/training-plans/{id}/color
    [HttpPut("{id:guid}/color")]
    public async Task<ActionResult<TrainingPlanDto>> SetColor(Guid id, [FromBody] UpdateTrainingPlanColorDto dto)
    {
        var userId = GetUserId();

        var plan = await _db.TrainingPlans
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (plan is null) return NotFound();

        plan.Color = string.IsNullOrWhiteSpace(dto.Color) ? null : dto.Color.Trim();
        plan.UpdatedUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(TrainingPlanDto.FromEntity(plan));
    }


    // POST: /api/training-plans/{id}/favorite
    [HttpPost("{id:guid}/favorite")]
    public async Task<IActionResult> ToggleFavorite(Guid id, [FromQuery] bool? value = null)
    {
        var userId = GetUserId();

        var plan = await _db.TrainingPlans
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (plan is null) return NotFound();

        plan.IsFavorite = value ?? !plan.IsFavorite;
        plan.UpdatedUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { plan.Id, plan.IsFavorite });
    }

    // DELETE: /api/training-plans/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();

        var plan = await _db.TrainingPlans
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (plan is null) return NotFound();

        _db.TrainingPlans.Remove(plan);
        await _db.SaveChangesAsync();

        return Ok(new { ok = true });
    }
}
