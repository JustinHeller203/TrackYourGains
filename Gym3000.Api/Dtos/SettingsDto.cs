namespace Gym3000.Api.Dtos;

public class SettingsDto
{
    public string Theme { get; set; } = "dark";
    public string PreferredUnit { get; set; } = "kg";

    public bool AutoCalcEnabled { get; set; } = false;
    public bool ConfirmDeleteEnabled { get; set; } = true;
    public bool BackToTopEnabled { get; set; } = false;
    public bool StickyTimerEnabled { get; set; } = true;
    public bool StickyStopwatchEnabled { get; set; } = true;

    public bool ToastsEnabled { get; set; } = true;
    public int ToastDurationMs { get; set; } = 2500;

    public string ToastTypeEnabledJson { get; set; } =
        "{\"toast-default\":true,\"toast-save\":true,\"toast-add\":true,\"toast-delete\":true,\"toast-timer\":true,\"toast-reset\":true}";
}
