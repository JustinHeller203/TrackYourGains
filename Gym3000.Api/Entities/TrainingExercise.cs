using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Gym3000.Api.Entities;

public class TrainingExercise
{
    public Guid Id { get; set; }

    public Guid DayId { get; set; }
    public TrainingDay Day { get; set; } = default!;

    [Required, MaxLength(160)]
    public string Name { get; set; } = default!;

    public TrainingCategory Category { get; set; }

    public int SortOrder { get; set; }

    // Optional: Strength
    public int? Sets { get; set; }
    public int? Reps { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal? TargetWeight { get; set; }

    public int? RestSeconds { get; set; }

    // Optional: Cardio
    public int? DurationMin { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal? DistanceKm { get; set; }

    // Optional: Stretch (oder allgemein)
    [MaxLength(600)]
    public string? Notes { get; set; }
}
