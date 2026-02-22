using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Entities;

public class UserProfile
{
    [Key]
    [MaxLength(64)]
    public string UserId { get; set; } = default!;

    [MaxLength(80)]
    public string DisplayName { get; set; } = string.Empty;

    [MaxLength(280)]
    public string Motto { get; set; } = string.Empty;

    public string? AvatarDataUrl { get; set; }

    public string ActivityJson { get; set; } = "[]";
    public string ProgressJson { get; set; } = "{\"muscle\":40,\"weight\":60,\"nutrition\":55}";
    public string GoalOrderJson { get; set; } = "[\"muscle\",\"weight\",\"nutrition\"]";
    public string EarnedBadgesJson { get; set; } = "[]";

    public int FavoriteTimers { get; set; } = 2;

    public DateTime MemberSinceUtc { get; set; } = DateTime.UtcNow.Date;
    public DateTime UpdatedUtc { get; set; } = DateTime.UtcNow;
}
