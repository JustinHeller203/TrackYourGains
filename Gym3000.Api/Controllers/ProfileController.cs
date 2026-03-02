using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using Gym3000.Api.Data;
using Gym3000.Api.Dtos;
using Gym3000.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
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
    private readonly UserManager<IdentityUser> _um;
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

    public ProfileController(ApplicationDbContext db, UserManager<IdentityUser> um)
    {
        _db = db;
        _um = um;
    }

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
        var user = await _um.FindByIdAsync(userId);
        if (user is null)
            return Unauthorized(new { message = "User nicht gefunden." });

        if (dto.Username is not null)
        {
            var newUsername = dto.Username.Trim();
            if (string.IsNullOrWhiteSpace(newUsername))
                return BadRequest(new { message = "Username darf nicht leer sein." });

            var existing = await _um.FindByNameAsync(newUsername);
            if (existing is not null && existing.Id != user.Id)
                return BadRequest(new { message = "Username ist bereits vergeben." });

            var setUserName = await _um.SetUserNameAsync(user, newUsername);
            if (!setUserName.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Username konnte nicht gespeichert werden.",
                    errors = setUserName.Errors.Select(e => e.Description)
                });
            }
        }

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

        var username = user.UserName ?? "";

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
