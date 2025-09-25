using System;
using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Entities;

public class RefreshToken
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [Required] public string UserId { get; set; } = default!;

    // Session-/Geräte-Familie (pro Device genau eine Kette)
    [Required, MaxLength(64)] public string FamilyId { get; set; } = default!; // Guid als string
    [MaxLength(64)] public string? DeviceId { get; set; }                      // vom Client gesendet (UUID)

    // Sicherheit – niemals Klartext speichern
    [Required, MaxLength(128)] public string TokenHash { get; set; } = default!; // Hash(token + salt + pepper)
    [Required, MaxLength(64)] public string Salt { get; set; } = default!;      // pro-Token Salt

    // Lebenszyklus
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }

    [MaxLength(64)] public string? CreatedByIp { get; set; }
    [MaxLength(512)] public string? UserAgent { get; set; }

    // Rotation / Chain
    public bool IsCurrent { get; set; } = true;                  // genau 1 aktueller Token je (User, Device, Family)
    [MaxLength(128)] public string? ReplacedByTokenHash { get; set; } // Hash des Nachfolgers
    public bool ReuseDetected { get; set; } = false;             // wenn ein alter Token auftaucht => Flag setzen

    // Telemetrie
    public DateTime? LastSeenAtUtc { get; set; }
    [MaxLength(64)] public string? LastSeenIp { get; set; }
    [MaxLength(64)] public string? JwtId { get; set; }           // jti des Access-Tokens bei Ausgabe

    // Convenience
    public bool IsExpired => DateTime.UtcNow >= ExpiresAtUtc;
    public bool IsActive => IsCurrent && RevokedAtUtc == null && !IsExpired;
}
