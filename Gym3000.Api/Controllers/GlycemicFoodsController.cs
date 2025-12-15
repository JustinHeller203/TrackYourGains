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
    public async Task<ActionResult<IEnumerable<GlycemicFoodDto>>> Get([FromQuery] string? query, [FromQuery] int take = 80)
    {
        take = Math.Clamp(take, 1, 200);

        var q = (query ?? "").Trim().ToLowerInvariant();

        var baseQuery = db.GlycemicFoods.AsNoTracking();

        if (!string.IsNullOrEmpty(q))
        {
            baseQuery = baseQuery.Where(x =>
                x.Label.ToLower().Contains(q) ||
                x.Key.ToLower().Contains(q));
        }

        var items = await baseQuery
            .OrderBy(x => x.Label)
            .Take(take)
            .Select(x => new GlycemicFoodDto(x.Id, x.Key, x.Label, x.Gi, x.Carbs100, x.Note))
            .ToListAsync();

        return Ok(items);
    }
}
