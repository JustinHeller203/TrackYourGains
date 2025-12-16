//GlycemicFood.cs
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

    // Kategorie fürs Filtern (fruit, grain, dairy, drink, snack, veg, legume, other)
    [MaxLength(40)]
    public string Category { get; set; } = "other";

    // GI ist optional + ggf. Spannweite
    public int? Gi { get; set; }
    public int? GiMin { get; set; }
    public int? GiMax { get; set; }

    // KH pro 100g (optional)
    [Column(TypeName = "numeric(6,2)")]
    public decimal? Carbs100 { get; set; }

    // Standardportion in Gramm (optional)
    [Column(TypeName = "numeric(6,2)")]
    public decimal? ServingG { get; set; }

    // Zusatzwerte pro 100g (optional)
    [Column(TypeName = "numeric(6,2)")]
    public decimal? Fiber100 { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal? Sugar100 { get; set; }

    public int? Calories100 { get; set; }

    // Synonyme für Suche (z.B. ["weissbrot","toast","weißbrot"])
    [Column(TypeName = "text[]")]
    public string[]? Aliases { get; set; }

    [MaxLength(220)]
    public string? Note { get; set; }

    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;

}
