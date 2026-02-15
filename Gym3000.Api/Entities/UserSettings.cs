using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Entities;

public class UserSettings
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(64)]
    public string UserId { get; set; } = default!;

    // Display
    [Required]
    [MaxLength(10)]
    public string Theme { get; set; } = "dark"; // "light" | "dark"

    [Required]
    [MaxLength(10)]
    public string PreferredUnit { get; set; } = "kg"; // "kg" | "lbs"

    // System
    public bool AutoCalcEnabled { get; set; } = false;
    public bool ConfirmDeleteEnabled { get; set; } = true;
    public bool BackToTopEnabled { get; set; } = false;
    public bool StickyTimerEnabled { get; set; } = true;
    public bool StickyStopwatchEnabled { get; set; } = true;

    // Toasts
    public bool ToastsEnabled { get; set; } = true;
    public int ToastDurationMs { get; set; } = 2500;

    public string ToastTypeEnabledJson { get; set; } =
     "{\"toast-default\":true,\"toast-save\":true,\"toast-add\":true,\"toast-delete\":true,\"toast-timer\":true,\"toast-reset\":true}";


    public DateTime UpdatedUtc { get; set; } = DateTime.UtcNow;
}
