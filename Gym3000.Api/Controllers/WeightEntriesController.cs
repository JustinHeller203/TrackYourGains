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
    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

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
        // Datum hart auf reines Datum normalisieren
        var dateOnly = dto.Date.Date;

        // Optional: Du könntest hier prüfen, ob es schon existiert, um sauberere Fehlermeldung vor DB-Insert zu liefern
        var already = await db.WeightEntries
            .AnyAsync(w => w.UserId == UserId && w.Date == dateOnly);

        if (already)
            return Conflict(new { message = "Für dieses Datum existiert bereits ein Eintrag." });

        var entity = new WeightEntry
        {
            UserId = UserId,
            Weight = dto.Weight,
            Date = dateOnly
        };

        db.WeightEntries.Add(entity);

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Falls Parallel-Request die Unique-Constraint triggert:
            return Conflict(new { message = "Für dieses Datum existiert bereits ein Eintrag." });
        }

        var response = new WeightEntryDto(entity.Id, entity.Weight, entity.Date);
        return Ok(response);
    }
}
