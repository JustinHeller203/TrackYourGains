using Gym3000.Api.Entities;

namespace Gym3000.Api.Dtos.Training;

public record TrainingPlanListItemDto(
    Guid Id,
    string Name,
    bool IsFavorite,
    DateTime CreatedUtc,
    DateTime UpdatedUtc
);

public record TrainingExerciseDto(
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

public record TrainingDayDto(
    Guid Id,
    string Name,
    int SortOrder,
    List<TrainingExerciseDto> Exercises
);

public record TrainingPlanDto(
    Guid Id,
    string Name,
    bool IsFavorite,
    DateTime CreatedUtc,
    DateTime UpdatedUtc,
    List<TrainingDayDto> Days
)
{
    public static TrainingPlanDto FromEntity(TrainingPlan p) => new(
        p.Id,
        p.Name,
        p.IsFavorite,
        p.CreatedUtc,
        p.UpdatedUtc,
        p.Days
            .OrderBy(d => d.SortOrder)
            .Select(d => new TrainingDayDto(
                d.Id,
                d.Name,
                d.SortOrder,
                d.Exercises
                    .OrderBy(x => x.SortOrder)
                    .Select(x => new TrainingExerciseDto(
                        x.Id,
                        x.Name,
                        x.Category,
                        x.SortOrder,
                        x.Sets,
                        x.Reps,
                        x.TargetWeight,
                        x.RestSeconds,
                        x.DurationMin,
                        x.DistanceKm,
                        x.Notes
                    ))
                    .ToList()
            ))
            .ToList()
    );
}

public record UpsertTrainingExerciseDto(
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

public record UpsertTrainingDayDto(
    string Name,
    int SortOrder,
    List<UpsertTrainingExerciseDto> Exercises
);

public record UpsertTrainingPlanDto(
    string Name,
    bool IsFavorite,
    List<UpsertTrainingDayDto> Days
);
