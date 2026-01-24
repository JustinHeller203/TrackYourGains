using Gym3000.Api.Entities;

namespace Gym3000.Api.Dtos.Plans;

public record PlanListDto(
    Guid Id,
    string Name,
    bool IsFavorite,
    DateTime UpdatedUtc
);

public record PlanDetailDto(
    Guid Id,
    string Name,
    bool IsFavorite,
    DateTime CreatedUtc,
    DateTime UpdatedUtc,
    List<PlanDayDto> Days
);

public record PlanDayDto(
    Guid Id,
    string Name,
    int SortOrder,
    List<PlanExerciseDto> Exercises
);

public record PlanExerciseDto(
    Guid Id,
    string Name,
    TrainingCategory Category,
    int SortOrder,
    int? Sets,
    int? Reps,
    decimal? TargetWeight,
    int? RestSeconds,
    int? DurationMin,
    decimal? DistanceKm,
    string? Notes
);
