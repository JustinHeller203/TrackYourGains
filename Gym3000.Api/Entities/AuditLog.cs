using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Entities;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [MaxLength(64)]
    public string? UserId { get; set; }   // kann null sein (z.B. Login-Fail ohne User)

    [Required, MaxLength(64)]
    public string Action { get; set; } = default!; // e.g. LOGIN_SUCCESS, LOGIN_FAIL, CHANGE_EMAIL, etc.

    [MaxLength(64)]
    public string? Ip { get; set; }

    [MaxLength(256)]
    public string? UserAgent { get; set; }

    // optional: zusätzliche Infos (z.B. target email)
    [MaxLength(512)]
    public string? Meta { get; set; }

    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
}
