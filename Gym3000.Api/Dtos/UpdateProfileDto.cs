namespace Gym3000.Api.Dtos;

public class UpdateProfileDto
{
    public bool? HasCreatedTrainingPlan { get; init; }
    public string? DisplayName { get; init; }
    public string? Motto { get; init; }
    public string? AvatarDataUrl { get; init; }
    public int? FavoriteTimers { get; init; }
    public DateTime? MemberSinceUtc { get; init; }
    public int[]? Activity { get; init; }
    public Dictionary<string, double>? Progress { get; init; }
    public string[]? GoalOrder { get; init; }
    public string[]? EarnedBadges { get; init; }
}
