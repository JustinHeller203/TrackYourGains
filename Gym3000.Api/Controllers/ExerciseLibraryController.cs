using System.Text.Json;
using Gym3000.Api.Data;
using Gym3000.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Gym3000.Api.Controllers;

[ApiController]
[Route("api/exercise-library")]
public class ExerciseLibraryController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ExerciseLibraryEntryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ExerciseLibraryEntryDto>>> Get(
        [FromQuery] string? query,
        [FromQuery] string? muscleGroup,
        [FromQuery] int take = 400)
    {
        take = Math.Clamp(take, 1, 1000);
        var q = (query ?? string.Empty).Trim();
        var group = (muscleGroup ?? string.Empty).Trim();

        var baseQuery = db.ExerciseLibraryEntries
            .AsNoTracking()
            .Include(x => x.Aliases)
            .Where(x => x.IsActive);

        if (!string.IsNullOrWhiteSpace(group))
        {
            var pattern = $"%{group}%";
            baseQuery = baseQuery.Where(x =>
                EF.Functions.ILike(x.PrimaryMuscleGroup, pattern) ||
                x.SecondaryMuscleGroups.Any(m => EF.Functions.ILike(m, pattern)));
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            var pattern = $"%{q}%";
            baseQuery = baseQuery.Where(x =>
                EF.Functions.ILike(x.Name, pattern) ||
                EF.Functions.ILike(x.Key, pattern) ||
                x.Aliases.Any(a => EF.Functions.ILike(a.Value, pattern)));
        }

        var rows = await baseQuery
            .OrderBy(x => x.Name)
            .Take(take)
            .ToListAsync();

        var items = rows.Select(x => new ExerciseLibraryEntryDto(
            x.Id,
            x.Key,
            x.Name,
            x.PrimaryMuscleGroup,
            x.SecondaryMuscleGroups ?? [],
            x.Kind,
            x.MovementPattern,
            x.Equipment ?? [],
            x.Level,
            x.Stability,
            x.AxialLoad,
            x.Overhead,
            x.DeepKneeFlexion,
            x.Impact,
            x.Rotation,
            ParseJointLoad(x.JointLoadJson),
            x.GoalTags ?? [],
            x.Substitutions ?? [],
            x.Aliases.Select(a => a.Value).OrderBy(v => v).ToArray()
        ));

        return Ok(items);
    }

    private static Dictionary<string, string> ParseJointLoad(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string>>(json) ?? [];
        }
        catch
        {
            return [];
        }
    }
}
