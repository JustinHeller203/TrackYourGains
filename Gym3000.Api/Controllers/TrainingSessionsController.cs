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
[Route("api/training-sessions")]
[Authorize]
[Produces("application/json")]
public class TrainingSessionsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public TrainingSessionsController(ApplicationDbContext db)
    {
        _db = db;
    }

    private string? GetUserId()
        => User.FindFirstValue(ClaimTypes.NameIdentifier)
           ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

    private static TrainingSessionFeedbackResultDto ToFeedbackResultDto(TrainingSession session)
    {
        var f = session.Feedback;
        return new TrainingSessionFeedbackResultDto(
            session.Id,
            session.PlanId,
            session.FinishedAtUtc,
            f?.Id,
            f?.Intensity,
            f?.BestExercise,
            f?.StrengthTechnique,
            f?.CardioIntensity,
            f?.StretchPain,
            f?.Note
        );
    }

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] Guid? planId = null,
        [FromQuery] DateTime? fromUtc = null,
        [FromQuery] DateTime? toUtc = null)
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        var q = _db.TrainingSessions
            .AsNoTracking()
            .Include(x => x.Feedback)
            .Where(x => x.UserId == userId);

        if (planId.HasValue && planId.Value != Guid.Empty)
            q = q.Where(x => x.PlanId == planId.Value);

        if (fromUtc.HasValue)
            q = q.Where(x => x.FinishedAtUtc >= fromUtc.Value);

        if (toUtc.HasValue)
            q = q.Where(x => x.FinishedAtUtc <= toUtc.Value);

        var items = await q
            .OrderByDescending(x => x.FinishedAtUtc)
            .Take(500)
            .ToListAsync();

        return Ok(items.Select(ToFeedbackResultDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTrainingSessionDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        if (dto.PlanId == Guid.Empty)
            return BadRequest(new { message = "planId fehlt." });

        var planOk = await _db.TrainingPlans.AnyAsync(p => p.Id == dto.PlanId && p.UserId == userId);
        if (!planOk)
            return NotFound(new { message = "Plan nicht gefunden." });

        var now = DateTime.UtcNow;
        var finished = dto.FinishedAtUtc ?? now;
        var started = dto.StartedAtUtc;
        if (started.HasValue && started.Value > finished)
            started = finished;

        string? typesPresent = null;
        if (dto.TypesPresent != null && dto.TypesPresent.Count > 0)
        {
            var types = dto.TypesPresent
                .Select(t => (t ?? string.Empty).Trim())
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Select(t => t.ToLowerInvariant())
                .Distinct()
                .ToList();

            if (types.Count > 0)
                typesPresent = string.Join(',', types);
        }

        var session = new TrainingSession
        {
            UserId = userId,
            PlanId = dto.PlanId,
            StartedAtUtc = started,
            FinishedAtUtc = finished,
            CreatedUtc = now,
            DurationSec = dto.DurationSec,
            ExercisesTotal = dto.ExercisesTotal,
            ExercisesDone = dto.ExercisesDone,
            TypesPresent = typesPresent
        };

        TrainingSessionFeedback? feedback = null;
        if (dto.Feedback is not null)
        {
            feedback = new TrainingSessionFeedback
            {
                Session = session,
                UserId = userId,
                PlanId = dto.PlanId,
                CreatedUtc = now,
                Intensity = dto.Feedback.Intensity,
                BestExercise = string.IsNullOrWhiteSpace(dto.Feedback.BestExercise) ? null : dto.Feedback.BestExercise.Trim(),
                StrengthTechnique = dto.Feedback.StrengthTechnique,
                CardioIntensity = dto.Feedback.CardioIntensity,
                StretchPain = dto.Feedback.StretchPain,
                Note = string.IsNullOrWhiteSpace(dto.Feedback.Note) ? null : dto.Feedback.Note.Trim()
            };

            _db.TrainingSessionFeedbacks.Add(feedback);
        }

        _db.TrainingSessions.Add(session);
        await _db.SaveChangesAsync();

        return Ok(new TrainingSessionCreateResultDto(session.Id, feedback?.Id));
    }

    [HttpPut("{sessionId:guid}/feedback")]
    public async Task<IActionResult> UpsertFeedback(Guid sessionId, [FromBody] UpdateTrainingSessionFeedbackDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nicht eingeloggt." });

        var session = await _db.TrainingSessions
            .Include(x => x.Feedback)
            .FirstOrDefaultAsync(x => x.Id == sessionId && x.UserId == userId);

        if (session is null)
            return NotFound(new { message = "Training-Session nicht gefunden." });

        var feedback = session.Feedback;
        if (feedback is null)
        {
            feedback = new TrainingSessionFeedback
            {
                SessionId = session.Id,
                UserId = userId,
                PlanId = session.PlanId,
                CreatedUtc = DateTime.UtcNow
            };
            _db.TrainingSessionFeedbacks.Add(feedback);
            session.Feedback = feedback;
        }

        feedback.Intensity = dto.Intensity;
        feedback.BestExercise = string.IsNullOrWhiteSpace(dto.BestExercise) ? null : dto.BestExercise.Trim();
        feedback.StrengthTechnique = dto.StrengthTechnique;
        feedback.CardioIntensity = dto.CardioIntensity;
        feedback.StretchPain = dto.StretchPain;
        feedback.Note = string.IsNullOrWhiteSpace(dto.Note) ? null : dto.Note.Trim();

        await _db.SaveChangesAsync();

        return Ok(ToFeedbackResultDto(session));
    }
}
