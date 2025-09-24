namespace Gym3000.Api.Entities;

public class AuditLog
{
    public Guid Id { get; set; }

    public string? UserId { get; set; }

    // z.B. "login_success", "login_failed", "refresh_reuse_detected", ...
    public string Action { get; set; } = default!;

    public string? Ip { get; set; }
    public string? UserAgent { get; set; }

    // JSON-String mit Zusatzinfos (optional)
    public string? Meta { get; set; }

    public DateTime CreatedUtc { get; set; }
}
