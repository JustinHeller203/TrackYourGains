using System.ComponentModel.DataAnnotations;
using Gym3000.Api.Entities;

namespace Gym3000.Api.Dtos.Plans;

public class CreatePlanDto
{
    [Required, MaxLength(120)]
    public string Name { get; set; } = default!;

    public List<CreatePlanDayDto> Days { get; set; } = new();
}

public class CreatePlanDayDto
{
    [Required, MaxLength(120)]
    public string Name { get; set; } = default!;

    public int SortOrder { get; set; }

    public List<CreatePlanExerciseDto> Exercises { get; set; } = new();
}

public class CreatePlanExerciseDto
{
    [Required, MaxLength(160)]
    public string Name { get; set; } = default!;

    public TrainingCategory Category { get; set; }
    public int SortOrder { get; set; }

    public int? Sets { get; set; }
    public int? Reps { get; set; }
    public decimal? TargetWeight { get; set; }
    public int? RestSeconds { get; set; }

    public int? DurationMin { get; set; }
    public decimal? DistanceKm { get; set; }

    [MaxLength(600)]
    public string? Notes { get; set; }
}

public class UpdatePlanDto
{
    [Required, MaxLength(120)]
    public string Name { get; set; } = default!;

    public bool IsFavorite { get; set; }
}
