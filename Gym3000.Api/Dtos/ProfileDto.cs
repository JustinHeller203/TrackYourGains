namespace Gym3000.Api.Dtos;

public class ProfileDto
{
    public string Username { get; init; } = string.Empty;
    public bool HasCreatedTrainingPlan { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public string Motto { get; init; } = string.Empty;
    public string? AvatarDataUrl { get; init; }
    public int FavoriteTimers { get; init; }
    public DateTime MemberSinceUtc { get; init; }
    public int[] Activity { get; init; } = Array.Empty<int>();
    public Dictionary<string, double> Progress { get; init; } = new();
    public string[] GoalOrder { get; init; } = Array.Empty<string>();
    public string[] EarnedBadges { get; init; } = Array.Empty<string>();
}
