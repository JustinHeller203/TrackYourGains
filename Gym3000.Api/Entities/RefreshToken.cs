using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Entities;

public class RefreshToken
{
	[Key] public Guid Id { get; set; } = Guid.NewGuid();

	[Required] public string UserId { get; set; } = default!;

	// nur Hash speichern, niemals das rohe Token
	[Required] public string TokenHash { get; set; } = default!;

	public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
	public DateTime ExpiresAtUtc { get; set; }
	public DateTime? RevokedAtUtc { get; set; }

	public string? CreatedByIp { get; set; }
	public string? UserAgent { get; set; }

	public bool IsActive => RevokedAtUtc is null && DateTime.UtcNow < ExpiresAtUtc;
}
