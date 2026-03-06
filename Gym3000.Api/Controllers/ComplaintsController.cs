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
[Route("api/complaints")]
[Authorize]
[Produces("application/json")]
public class ComplaintsController : ControllerBase
{
    private static readonly HashSet<string> AllowedAreas = new(StringComparer.OrdinalIgnoreCase)
    {
        "nacken", "schulter", "ellbogen", "handgelenk", "ruecken", "huefte", "knie", "sprunggelenk", "kopf", "sonstiges"
    };

    private static readonly HashSet<string> AllowedCategories = new(StringComparer.OrdinalIgnoreCase)
    {
        "muskelkater", "ueberlastung", "schmerz"
    };

    private static readonly HashSet<string> AllowedStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "aktiv", "besser", "weg"
    };

    private readonly ApplicationDbContext _db;

    public ComplaintsController(ApplicationDbContext db)
    {
        _db = db;
    }

    private string? GetUserId()
        => User.FindFirstValue(ClaimTypes.NameIdentifier)
           ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        var rows = await _db.ComplaintEntries
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.CreatedAt)
            .Select(x => new ComplaintEntryDto(
                x.Id,
                x.Area,
                x.Category,
                x.Status,
                x.Intensity,
                x.Date,
                x.Notes,
                x.CreatedAt
            ))
            .ToListAsync();

        return Ok(rows);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateComplaintEntryDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        var area = Normalize(dto.Area);
        var category = Normalize(dto.Category);
        var status = Normalize(dto.Status);
        var notes = NormalizeNullable(dto.Notes);

        if (!AllowedAreas.Contains(area))
            return BadRequest(new { message = "Ungültige Körperstelle." });
        if (!AllowedCategories.Contains(category))
            return BadRequest(new { message = "Ungültige Art." });
        if (!AllowedStatuses.Contains(status))
            return BadRequest(new { message = "Ungültiger Status." });
        if (dto.Intensity is < 1 or > 10)
            return BadRequest(new { message = "Intensität muss zwischen 1 und 10 liegen." });

        var isOpenStatus = status is "aktiv" or "besser";
        var isSonstiges = area == "sonstiges";
        if (isOpenStatus && !isSonstiges)
        {
            var hasOpenDuplicate = await _db.ComplaintEntries.AnyAsync(x =>
                x.UserId == userId &&
                x.Area == area &&
                x.Category == category &&
                (x.Status == "aktiv" || x.Status == "besser"));

            if (hasOpenDuplicate)
                return BadRequest(new { message = "Für diese Körperstelle und Art existiert bereits ein aktiver Eintrag." });
        }

        var entry = new ComplaintEntry
        {
            UserId = userId,
            Area = area,
            Category = category,
            Status = status,
            Intensity = dto.Intensity,
            Date = dto.Date.Date,
            Notes = notes,
            CreatedAt = DateTime.UtcNow
        };

        _db.ComplaintEntries.Add(entry);
        await _db.SaveChangesAsync();

        return Ok(new ComplaintEntryDto(
            entry.Id,
            entry.Area,
            entry.Category,
            entry.Status,
            entry.Intensity,
            entry.Date,
            entry.Notes,
            entry.CreatedAt
        ));
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus([FromRoute] Guid id, [FromBody] UpdateComplaintStatusDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        var entry = await _db.ComplaintEntries.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (entry is null)
            return NotFound(new { message = "Eintrag nicht gefunden." });

        var status = Normalize(dto.Status);
        if (!AllowedStatuses.Contains(status))
            return BadRequest(new { message = "Ungültiger Status." });

        var isOpenStatus = status is "aktiv" or "besser";
        var isSonstiges = string.Equals(entry.Area, "sonstiges", StringComparison.Ordinal);
        if (isOpenStatus && !isSonstiges)
        {
            var hasOpenDuplicate = await _db.ComplaintEntries.AnyAsync(x =>
                x.UserId == userId &&
                x.Id != entry.Id &&
                x.Area == entry.Area &&
                x.Category == entry.Category &&
                (x.Status == "aktiv" || x.Status == "besser"));

            if (hasOpenDuplicate)
                return BadRequest(new { message = "Für diese Körperstelle und Art existiert bereits ein aktiver Eintrag." });
        }

        entry.Status = status;
        await _db.SaveChangesAsync();

        return Ok(new ComplaintEntryDto(
            entry.Id,
            entry.Area,
            entry.Category,
            entry.Status,
            entry.Intensity,
            entry.Date,
            entry.Notes,
            entry.CreatedAt
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        var entry = await _db.ComplaintEntries.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (entry is null)
            return NotFound(new { message = "Eintrag nicht gefunden." });

        _db.ComplaintEntries.Remove(entry);
        await _db.SaveChangesAsync();

        return Ok(new { ok = true });
    }

    private static string Normalize(string value)
        => value.Trim().ToLowerInvariant();

    private static string? NormalizeNullable(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return value.Trim();
    }
}
