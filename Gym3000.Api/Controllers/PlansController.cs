//PlansController.cs
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Gym3000.Api.Data;
using Gym3000.Api.Dtos.Plans;
using Gym3000.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Gym3000.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/plans")]
[Produces("application/json")]
public class PlansController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public PlansController(ApplicationDbContext db)
    {
        _db = db;
    }

    private string? GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

    [HttpGet]
    public async Task<ActionResult<List<PlanListDto>>> List()
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var plans = await _db.TrainingPlans
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.IsFavorite)
            .ThenByDescending(p => p.UpdatedUtc)
            .Select(p => new PlanListDto(p.Id, p.Name, p.IsFavorite, p.UpdatedUtc))
            .ToListAsync();

        return Ok(plans);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PlanDetailDto>> Get(Guid id)
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var plan = await _db.TrainingPlans
            .Include(p => p.Days.OrderBy(d => d.SortOrder))
                .ThenInclude(d => d.Exercises.OrderBy(x => x.SortOrder))
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (plan is null) return NotFound(new { message = "Plan nicht gefunden." });

        var dto = new PlanDetailDto(
            plan.Id,
            plan.Name,
            plan.IsFavorite,
            plan.CreatedUtc,
            plan.UpdatedUtc,
            plan.Days
                .OrderBy(d => d.SortOrder)
                .Select(d => new PlanDayDto(
                    d.Id,
                    d.Name,
                    d.SortOrder,
                    d.Exercises
                        .OrderBy(x => x.SortOrder)
                        .Select(x => new PlanExerciseDto(
                            x.Id,
                            x.Name,
                            x.Category,
                            x.SortOrder,
                            x.Sets,
                            x.Reps,
                            x.TargetWeight,
                            x.RestSeconds,
                            x.DurationMin,
                            x.DistanceKm,
                            x.Notes
                        )).ToList()
                )).ToList()
        );

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<PlanDetailDto>> Create([FromBody] CreatePlanDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var plan = new TrainingPlan
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = dto.Name.Trim(),
            IsFavorite = false,
            CreatedUtc = DateTime.UtcNow,
            UpdatedUtc = DateTime.UtcNow,
            Days = dto.Days.Select(d => new TrainingDay
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
                    Notes = x.Notes
                }).ToList()
            }).ToList()
        };

        _db.TrainingPlans.Add(plan);
        await _db.SaveChangesAsync();

        return await Get(plan.Id);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePlanDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var plan = await _db.TrainingPlans.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
        if (plan is null) return NotFound(new { message = "Plan nicht gefunden." });

        plan.Name = dto.Name.Trim();
        plan.IsFavorite = dto.IsFavorite;
        plan.UpdatedUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }

    [HttpPost("{id:guid}/favorite")]
    public async Task<IActionResult> ToggleFavorite(Guid id)
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var plan = await _db.TrainingPlans.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
        if (plan is null) return NotFound(new { message = "Plan nicht gefunden." });

        plan.IsFavorite = !plan.IsFavorite;
        plan.UpdatedUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { ok = true, isFavorite = plan.IsFavorite });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var plan = await _db.TrainingPlans.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
        if (plan is null) return NotFound(new { message = "Plan nicht gefunden." });

        _db.TrainingPlans.Remove(plan);
        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }
}
