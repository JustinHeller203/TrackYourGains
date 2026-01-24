//TrainingPlansController.cs

using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Gym3000.Api.Data;
using Gym3000.Api.Dtos.Training;
using Gym3000.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

    // POST: /api/training-plans
    [HttpPost]
    public async Task<ActionResult<TrainingPlanDto>> Create([FromBody] UpsertTrainingPlanDto dto)
    {
        var userId = GetUserId();

        var now = DateTime.UtcNow;

        var plan = new TrainingPlan
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = dto.Name.Trim(),
            IsFavorite = dto.IsFavorite,
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
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOne), new { id = plan.Id }, TrainingPlanDto.FromEntity(plan));
    }

    // PUT: /api/training-plans/{id}
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TrainingPlanDto>> Update(Guid id, [FromBody] UpsertTrainingPlanDto dto)
    {
        var userId = GetUserId();
        var now = DateTime.UtcNow;

        var plan = await _db.TrainingPlans
            .Include(p => p.Days)
                .ThenInclude(d => d.Exercises)
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (plan is null) return NotFound();

        plan.Name = dto.Name.Trim();
        plan.IsFavorite = dto.IsFavorite;
        plan.UpdatedUtc = now;

        // simpel & robust: wir ersetzen Days+Exercises komplett (V1)
        _db.TrainingExercises.RemoveRange(plan.Days.SelectMany(d => d.Exercises));
        _db.TrainingDays.RemoveRange(plan.Days);

        plan.Days = dto.Days.Select(d => new TrainingDay
        {
            Id = Guid.NewGuid(),
            PlanId = plan.Id,
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
