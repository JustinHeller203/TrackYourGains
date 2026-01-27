using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Gym3000.Api.Entities;

public class ProgressEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string UserId { get; set; } = default!;

    public Guid PlanId { get; set; }
    public TrainingPlan Plan { get; set; } = default!;

    public DateTime Date { get; set; } // DATE (ohne Uhrzeit) in DB

    [Required, MaxLength(160)]
    public string Exercise { get; set; } = default!;

    public WorkoutType Type { get; set; } = WorkoutType.Strength;

    // Strength/Calisthenics
    public int? Sets { get; set; }
    public int? Reps { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal? WeightKg { get; set; }

    // Cardio / Stretch
    public int? DurationMin { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal? DistanceKm { get; set; }

    [MaxLength(800)]
    public string? Note { get; set; }

    // optional später:
    [MaxLength(40)]
    public string? Tempo { get; set; }
    public int? RestSeconds { get; set; }
}
