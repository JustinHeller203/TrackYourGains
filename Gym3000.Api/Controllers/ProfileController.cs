using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using Gym3000.Api.Data;
using Gym3000.Api.Dtos;
using Gym3000.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Gym3000.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Produces("application/json")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

    public ProfileController(ApplicationDbContext db) => _db = db;

    private static int[] DefaultActivity() => Enumerable.Repeat(0, 21).ToArray();

    private static Dictionary<string, double> DefaultProgress() => new()
    {
        ["muscle"] = 40,
        ["weight"] = 60,
        ["nutrition"] = 55
    };

    private static string[] DefaultGoalOrder() => new[] { "muscle", "weight", "nutrition" };

    private static T DeserializeOr<T>(string? json, T fallback)
    {
        if (string.IsNullOrWhiteSpace(json)) return fallback;
        try
        {
            return JsonSerializer.Deserialize<T>(json, JsonOpts) ?? fallback;
        }
        catch
        {
            return fallback;
        }
    }

    private static string Serialize<T>(T value) =>
        JsonSerializer.Serialize(value, JsonOpts);

    [HttpGet]
    public async Task<ActionResult<ProfileDto>> Get()
    {
        var userId = GetUserIdOrThrow();

        var metaDirty = false;
        var meta = await _db.UserMetas.FirstOrDefaultAsync(x => x.UserId == userId);
        if (meta is null)
        {
            meta = new UserMeta { UserId = userId, TokenVersion = 0, HasCreatedTrainingPlan = false };
            _db.UserMetas.Add(meta);
            metaDirty = true;
        }

        var profileDirty = false;
        var profile = await _db.UserProfiles.FirstOrDefaultAsync(x => x.UserId == userId);
        if (profile is null)
        {
            profile = new UserProfile
            {
                UserId = userId,
                DisplayName = string.Empty,
                Motto = string.Empty,
                AvatarDataUrl = null,
                ActivityJson = Serialize(DefaultActivity()),
                ProgressJson = Serialize(DefaultProgress()),
                GoalOrderJson = Serialize(DefaultGoalOrder()),
                EarnedBadgesJson = Serialize(Array.Empty<string>()),
                FavoriteTimers = 2,
                MemberSinceUtc = DateTime.UtcNow.Date,
                UpdatedUtc = DateTime.UtcNow
            };
            _db.UserProfiles.Add(profile);
            profileDirty = true;
        }

        if (metaDirty || profileDirty)
        {
            await _db.SaveChangesAsync();
        }

        var username = (await _db.Users
            .Where(u => u.Id == userId)
            .Select(u => u.UserName ?? "")
            .FirstOrDefaultAsync()) ?? "";

        var activity = DeserializeOr(profile.ActivityJson, DefaultActivity());
        var progress = DeserializeOr(profile.ProgressJson, DefaultProgress());
        var goalOrder = DeserializeOr(profile.GoalOrderJson, DefaultGoalOrder());
        var earnedBadges = DeserializeOr(profile.EarnedBadgesJson, Array.Empty<string>());

        return Ok(new ProfileDto
        {
            Username = username,
            HasCreatedTrainingPlan = meta.HasCreatedTrainingPlan,
            DisplayName = profile.DisplayName,
            Motto = profile.Motto,
            AvatarDataUrl = profile.AvatarDataUrl,
            FavoriteTimers = profile.FavoriteTimers,
            MemberSinceUtc = profile.MemberSinceUtc,
            Activity = activity,
            Progress = progress,
            GoalOrder = goalOrder,
            EarnedBadges = earnedBadges
        });
    }

    [HttpPut]
    public async Task<ActionResult<ProfileDto>> Put([FromBody] UpdateProfileDto dto)
    {
        var userId = GetUserIdOrThrow();

        var meta = await _db.UserMetas.FirstOrDefaultAsync(x => x.UserId == userId);
        if (meta is null)
        {
            meta = new UserMeta
            {
                UserId = userId,
                TokenVersion = 0,
                HasCreatedTrainingPlan = dto.HasCreatedTrainingPlan ?? false
            };
            _db.UserMetas.Add(meta);
        }
        else
        {
            if (dto.HasCreatedTrainingPlan.HasValue)
                meta.HasCreatedTrainingPlan = dto.HasCreatedTrainingPlan.Value;
        }

        var profile = await _db.UserProfiles.FirstOrDefaultAsync(x => x.UserId == userId);
        if (profile is null)
        {
            profile = new UserProfile
            {
                UserId = userId,
                DisplayName = string.Empty,
                Motto = string.Empty,
                AvatarDataUrl = null,
                ActivityJson = Serialize(DefaultActivity()),
                ProgressJson = Serialize(DefaultProgress()),
                GoalOrderJson = Serialize(DefaultGoalOrder()),
                EarnedBadgesJson = Serialize(Array.Empty<string>()),
                FavoriteTimers = 2,
                MemberSinceUtc = DateTime.UtcNow.Date,
                UpdatedUtc = DateTime.UtcNow
            };
            _db.UserProfiles.Add(profile);
        }

        if (dto.DisplayName is not null)
            profile.DisplayName = dto.DisplayName;

        if (dto.Motto is not null)
            profile.Motto = dto.Motto;

        if (dto.AvatarDataUrl is not null)
            profile.AvatarDataUrl = string.IsNullOrWhiteSpace(dto.AvatarDataUrl) ? null : dto.AvatarDataUrl;

        if (dto.FavoriteTimers.HasValue)
            profile.FavoriteTimers = Math.Max(0, dto.FavoriteTimers.Value);

        if (dto.MemberSinceUtc.HasValue)
            profile.MemberSinceUtc = dto.MemberSinceUtc.Value;

        if (dto.Activity is not null)
            profile.ActivityJson = Serialize(dto.Activity);

        if (dto.Progress is not null)
            profile.ProgressJson = Serialize(dto.Progress);

        if (dto.GoalOrder is not null)
            profile.GoalOrderJson = Serialize(dto.GoalOrder);

        if (dto.EarnedBadges is not null)
            profile.EarnedBadgesJson = Serialize(dto.EarnedBadges);

        profile.UpdatedUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var username = (await _db.Users
            .Where(u => u.Id == userId)
            .Select(u => u.UserName ?? "")
            .FirstOrDefaultAsync()) ?? "";

        var activity = DeserializeOr(profile.ActivityJson, DefaultActivity());
        var progress = DeserializeOr(profile.ProgressJson, DefaultProgress());
        var goalOrder = DeserializeOr(profile.GoalOrderJson, DefaultGoalOrder());
        var earnedBadges = DeserializeOr(profile.EarnedBadgesJson, Array.Empty<string>());

        return Ok(new ProfileDto
        {
            Username = username,
            HasCreatedTrainingPlan = meta.HasCreatedTrainingPlan,
            DisplayName = profile.DisplayName,
            Motto = profile.Motto,
            AvatarDataUrl = profile.AvatarDataUrl,
            FavoriteTimers = profile.FavoriteTimers,
            MemberSinceUtc = profile.MemberSinceUtc,
            Activity = activity,
            Progress = progress,
            GoalOrder = goalOrder,
            EarnedBadges = earnedBadges
        });
    }

    private string GetUserIdOrThrow()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (string.IsNullOrWhiteSpace(userId))
            throw new UnauthorizedAccessException("Nicht eingeloggt.");

        return userId;
    }
}
