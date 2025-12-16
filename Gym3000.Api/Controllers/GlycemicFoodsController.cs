//Glycemic Foods Controller
using Gym3000.Api.Data;
using Gym3000.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Gym3000.Api.Controllers;

[ApiController]
[Route("api/glycemic-foods")]
public class GlycemicFoodsController(ApplicationDbContext db) : ControllerBase
{
    /// <summary>
    /// Public: Liste + Suche. Beispiel: /api/glycemic-foods?query=ban&take=50
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<GlycemicFoodDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<GlycemicFoodDto>>> Get(
    [FromQuery] string? query,
    [FromQuery] string? category,
    [FromQuery] int take = 80)
    {
        take = Math.Clamp(take, 1, 200);

        var q = (query ?? "").Trim();
        var cat = (category ?? "").Trim();

        var baseQuery = db.GlycemicFoods.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(cat))
        {
            baseQuery = baseQuery.Where(x => EF.Functions.ILike(x.Category, cat));
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            var pattern = $"%{q}%";

            baseQuery = baseQuery.Where(x =>
                EF.Functions.ILike(x.Label, pattern) ||
                EF.Functions.ILike(x.Key, pattern) ||
                (x.Aliases != null && x.Aliases.Any(a => EF.Functions.ILike(a, pattern)))
            );
        }

        var items = await baseQuery
            .OrderBy(x => x.Label)
            .Take(take)
            .Select(x => new GlycemicFoodDto(
                x.Id,
                x.Key,
                x.Label,
                x.Category,
                x.Gi,
                x.GiMin,
                x.GiMax,
                x.Carbs100,
                x.ServingG,
                x.Fiber100,
                x.Sugar100,
                x.Calories100,
                x.Aliases,
                x.Note
            ))
            .ToListAsync();

        return Ok(items);
    }

}
