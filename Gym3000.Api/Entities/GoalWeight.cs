using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Gym3000.Api.Entities;

public class GoalWeight
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = default!;

    [Column(TypeName = "numeric(6,2)")]
    public decimal? GoalKg { get; set; }

    public DateTime UpdatedUtc { get; set; } = DateTime.UtcNow;
}
