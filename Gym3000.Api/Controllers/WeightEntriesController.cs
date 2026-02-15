using Gym3000.Api.Data;
using Gym3000.Api.Dtos;
using Gym3000.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Gym3000.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/weights")]
public class WeightEntriesController(ApplicationDbContext db) : ControllerBase
{
    private string UserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException("Missing user id claim (nameid/sub).");

    /// <summary>Dashboard Summary: latest weight + goal weight</summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(WeightSummaryDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<WeightSummaryDto>> GetSummary()
    {
        var latest = await db.WeightEntries
            .Where(w => w.UserId == UserId)
            .OrderByDescending(w => w.Date)
            .Select(w => new { w.Weight, w.Date })
            .FirstOrDefaultAsync();

        var goal = await db.GoalWeights
    .Where(g => g.UserId == UserId)
    .Select(g => g.GoalKg)
    .FirstOrDefaultAsync();

        return Ok(new WeightSummaryDto(
            LatestKg: latest?.Weight,
            LatestDate: latest?.Date,
            GoalKg: goal
        ));
    }

    /// <summary>Zielgewicht setzen (nullable -> Ziel löschen)</summary>
    [HttpPut("goal")]
    [ProducesResponseType(typeof(WeightSummaryDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<WeightSummaryDto>> SetGoal([FromBody] SetGoalWeightDto dto)
    {
        var row = await db.GoalWeights.FirstOrDefaultAsync(x => x.UserId == UserId);

        if (row is null)
        {
            row = new GoalWeight
            {
                UserId = UserId,
                GoalKg = dto.GoalKg,
                UpdatedUtc = DateTime.UtcNow
            };
            db.GoalWeights.Add(row);
        }
        else
        {
            row.GoalKg = dto.GoalKg;
            row.UpdatedUtc = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();

        // Return Summary (damit Frontend direkt neu rendern kann)
        var latest = await db.WeightEntries
            .Where(w => w.UserId == UserId)
            .OrderByDescending(w => w.Date)
            .Select(w => new { w.Weight, w.Date })
            .FirstOrDefaultAsync();

        return Ok(new WeightSummaryDto(
            LatestKg: latest?.Weight,
            LatestDate: latest?.Date,
            GoalKg: row.GoalKg
        ));
    }

    /// <summary>Alle Gewichts-Einträge des eingeloggten Users (absteigend nach Datum)</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<WeightEntryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<WeightEntryDto>>> GetAll()
    {
        var items = await db.WeightEntries
            .Where(w => w.UserId == UserId)
            .OrderByDescending(w => w.Date)
            .Select(w => new WeightEntryDto(w.Id, w.Weight, w.Date))
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>Gewichtseintrag anlegen (ein Eintrag pro Tag & Nutzer)</summary>
    [HttpPost]
    [ProducesResponseType(typeof(WeightEntryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<WeightEntryDto>> Create([FromBody] CreateWeightEntryDto dto)
    {
        var timestamp = dto.Date;

        // Npgsql + timestamptz verlangt UTC. "2026-02-13" kommt als Kind=Unspecified rein.
        timestamp = timestamp.Kind switch
        {
            DateTimeKind.Utc => timestamp,
            DateTimeKind.Local => timestamp.ToUniversalTime(),
            _ => DateTime.SpecifyKind(timestamp, DateTimeKind.Utc)
        };

        var entity = new WeightEntry
        {
            UserId = UserId,
            Weight = dto.Weight,
            Date = timestamp
        };

        db.WeightEntries.Add(entity);

        await db.SaveChangesAsync();

        var response = new WeightEntryDto(entity.Id, entity.Weight, entity.Date);
        return Ok(response);
    }
}
