using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Gym3000.Api.Entities;

public class WeightEntry
{
	public int Id { get; set; }

	// User-Relation (IdentityUser.Id ist string)
	[Required]
	public string UserId { get; set; } = default!;

	/// <summary>
	/// Gewicht in kg.
	/// </summary>
	[Column(TypeName = "numeric(6,2)")]
	public decimal Weight { get; set; }

	/// <summary>
	/// Datum des Eintrags (UTC-Datum, ohne Uhrzeit in DB als DATE).
	/// </summary>
	public DateTime Date { get; set; }
}
