using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Entities;

public class AuditLog
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    // wer (optional, z.B. bei fehlgeschlagenem Login unbekannt)
    [MaxLength(64)] public string? UserId { get; set; }
    [MaxLength(256)] public string? Email { get; set; }

    // was
    [MaxLength(64)] public string Action { get; set; } = default!; // z.B. "login.success", "login.fail", "password.change"
    [MaxLength(32)] public string Result { get; set; } = "ok";     // "ok" | "fail"

    // Kontext
    [MaxLength(64)] public string? Ip { get; set; }
    [MaxLength(512)] public string? UserAgent { get; set; }

    // optionales Detail (Fehlergrund etc.)
    [MaxLength(1024)] public string? Detail { get; set; }

    // wann
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
}
