using Gym3000.Api.Data;
using Gym3000.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Gym3000.Api.Controllers;

[ApiController]
[Route("api/mottos")]
[Produces("application/json")]
[Authorize]
public class MottosController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public MottosController(ApplicationDbContext db) => _db = db;

    [HttpGet("random")]
    public async Task<ActionResult<MottoDto>> GetRandom()
    {
        var motto = await _db.Mottos
            .OrderBy(_ => EF.Functions.Random())
            .Select(x => x.Text)
            .FirstOrDefaultAsync();

        if (string.IsNullOrWhiteSpace(motto))
            return Ok(new MottoDto { Text = "No excuses. Just results." });

        return Ok(new MottoDto { Text = motto });
    }
}
