using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Gym3000.Api.Entities;

public class GlycemicFood
{
	public int Id { get; set; }

	// stabiler Key für Frontend (z.B. "banana", "white_rice")
	[Required]
	[MaxLength(80)]
	public string Key { get; set; } = default!;

	[Required]
	[MaxLength(160)]
	public string Label { get; set; } = default!;

	// 0–110
	public int Gi { get; set; }

	// KH pro 100g
	[Column(TypeName = "numeric(6,2)")]
	public decimal Carbs100 { get; set; }

	[MaxLength(220)]
	public string? Note { get; set; }

	public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
}
