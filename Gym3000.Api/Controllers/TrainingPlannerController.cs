using Gym3000.Api.Data;
using Gym3000.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Gym3000.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/training-planner")]
public class TrainingPlannerController(ApplicationDbContext db) : ControllerBase
{
    private string UserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException("Missing user id claim (nameid/sub).");

    public record PlannerItemDto(Guid Id, Guid? PlanId, DateTime Date, string? PlanName, string? PlanColor, bool IsRestDay);
    public record UpsertPlannerDto(Guid PlanId, DateTime Date);
    public record UpsertRestDayDto(DateTime Date);

    private static DateTime NormalizeUtc(DateTime date)
    {
        return date.Kind switch
        {
            DateTimeKind.Utc => date,
            DateTimeKind.Local => date.ToUniversalTime(),
            _ => DateTime.SpecifyKind(date, DateTimeKind.Utc)
        };
    }

    [HttpGet]
    public async Task<ActionResult<List<PlannerItemDto>>> GetAll()
    {
        var plans = await db.TrainingPlanSchedules
            .Where(x => x.UserId == UserId)
            .Select(x => new PlannerItemDto(
                x.Id,
                x.PlanId,
                x.Date,
                x.Plan.Name,
                x.Plan.Color,
                false
            ))
            .ToListAsync();

        var rests = await db.TrainingRestDays
            .Where(x => x.UserId == UserId)
            .Select(x => new PlannerItemDto(
                x.Id,
                null,
                x.Date,
                null,
                null,
                true
            ))
            .ToListAsync();

        var items = plans
            .Concat(rests)
            .OrderByDescending(x => x.Date)
            .ToList();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<PlannerItemDto>> Add([FromBody] UpsertPlannerDto dto)
    {
        var planOk = await db.TrainingPlans.AnyAsync(p => p.Id == dto.PlanId && p.UserId == UserId);
        if (!planOk) return NotFound();

        var date = NormalizeUtc(dto.Date);

        await db.TrainingRestDays
            .Where(x => x.UserId == UserId && x.Date == date)
            .ExecuteDeleteAsync();

        var entity = new TrainingPlanSchedule
        {
            UserId = UserId,
            PlanId = dto.PlanId,
            Date = date,
            CreatedUtc = DateTime.UtcNow
        };

        db.TrainingPlanSchedules.Add(entity);
        await db.SaveChangesAsync();

        var plan = await db.TrainingPlans.FirstAsync(p => p.Id == dto.PlanId && p.UserId == UserId);
        return Ok(new PlannerItemDto(entity.Id, entity.PlanId, entity.Date, plan.Name, plan.Color, false));
    }

    [HttpDelete]
    public async Task<IActionResult> Remove([FromQuery] Guid planId, [FromQuery] DateTime date)
    {
        var dt = NormalizeUtc(date);

        var removed = await db.TrainingPlanSchedules
            .Where(x => x.UserId == UserId && x.PlanId == planId && x.Date == dt)
            .ExecuteDeleteAsync();

        if (removed == 0) return NotFound();
        return Ok(new { ok = true });
    }

    [HttpPost("rest")]
    public async Task<ActionResult<PlannerItemDto>> AddRest([FromBody] UpsertRestDayDto dto)
    {
        var date = NormalizeUtc(dto.Date);

        await db.TrainingPlanSchedules
            .Where(x => x.UserId == UserId && x.Date == date)
            .ExecuteDeleteAsync();

        await db.TrainingRestDays
            .Where(x => x.UserId == UserId && x.Date == date)
            .ExecuteDeleteAsync();

        var entity = new TrainingRestDay
        {
            UserId = UserId,
            Date = date,
            CreatedUtc = DateTime.UtcNow
        };

        db.TrainingRestDays.Add(entity);
        await db.SaveChangesAsync();

        return Ok(new PlannerItemDto(entity.Id, null, entity.Date, null, null, true));
    }

    [HttpDelete("rest")]
    public async Task<IActionResult> RemoveRest([FromQuery] DateTime date)
    {
        var dt = NormalizeUtc(date);

        var removed = await db.TrainingRestDays
            .Where(x => x.UserId == UserId && x.Date == dt)
            .ExecuteDeleteAsync();

        if (removed == 0) return NotFound();
        return Ok(new { ok = true });
    }
}
