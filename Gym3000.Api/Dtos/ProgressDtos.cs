using System.ComponentModel.DataAnnotations;
using Gym3000.Api.Entities;

namespace Gym3000.Api.Dtos;

public record ProgressEntryDto(
    Guid Id,
    Guid PlanId,
    DateTime Date,
    string Exercise,
    WorkoutType Type,
    int? Sets,
    int? Reps,
    decimal? WeightKg,
    int? DurationMin,
    decimal? DistanceKm,
    string? Note,
    string? Tempo,
    int? RestSeconds
);

public class CreateProgressEntryDto
{
    [Required] public Guid PlanId { get; init; }

    // "2026-01-26" kommt vom Client -> wird im Controller zu UTC.Date gemacht
    [Required] public DateTime Date { get; init; }

    [Required, MaxLength(160)] public string Exercise { get; init; } = string.Empty;

    [Required] public WorkoutType Type { get; init; } = WorkoutType.Strength;

    public int? Sets { get; init; }
    public int? Reps { get; init; }
    public decimal? WeightKg { get; init; }

    public int? DurationMin { get; init; }
    public decimal? DistanceKm { get; init; }

    [MaxLength(800)] public string? Note { get; init; }

    [MaxLength(40)] public string? Tempo { get; init; }
    public int? RestSeconds { get; init; }
}

public class UpdateProgressEntryDto
{
    [Required] public DateTime Date { get; init; }
    [Required, MaxLength(160)] public string Exercise { get; init; } = string.Empty;
    [Required] public WorkoutType Type { get; init; } = WorkoutType.Strength;

    public int? Sets { get; init; }
    public int? Reps { get; init; }
    public decimal? WeightKg { get; init; }

    public int? DurationMin { get; init; }
    public decimal? DistanceKm { get; init; }

    [MaxLength(800)] public string? Note { get; init; }

    [MaxLength(40)] public string? Tempo { get; init; }
    public int? RestSeconds { get; init; }
}
