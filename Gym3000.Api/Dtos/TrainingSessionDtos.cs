using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Dtos;

public class TrainingSessionFeedbackCreateDto
{
    [Range(1, 5)] public int? Intensity { get; init; }
    [MaxLength(160)] public string? BestExercise { get; init; }

    [Range(1, 5)] public int? StrengthTechnique { get; init; }
    [Range(1, 5)] public int? CardioIntensity { get; init; }
    [Range(1, 5)] public int? StretchPain { get; init; }

    [MaxLength(800)] public string? Note { get; init; }
}

public class UpdateTrainingSessionFeedbackDto
{
    [Range(1, 5)] public int? Intensity { get; init; }
    [MaxLength(160)] public string? BestExercise { get; init; }

    [Range(1, 5)] public int? StrengthTechnique { get; init; }
    [Range(1, 5)] public int? CardioIntensity { get; init; }
    [Range(1, 5)] public int? StretchPain { get; init; }

    [MaxLength(800)] public string? Note { get; init; }
}

public class CreateTrainingSessionDto
{
    [Required] public Guid PlanId { get; init; }

    public DateTime? StartedAtUtc { get; init; }
    public DateTime? FinishedAtUtc { get; init; }
    public int? DurationSec { get; init; }

    public int? ExercisesTotal { get; init; }
    public int? ExercisesDone { get; init; }

    public List<string>? TypesPresent { get; init; }

    public TrainingSessionFeedbackCreateDto? Feedback { get; init; }
}

public record TrainingSessionCreateResultDto(
    Guid SessionId,
    Guid? FeedbackId
);

public record TrainingSessionFeedbackResultDto(
    Guid SessionId,
    Guid PlanId,
    DateTime FinishedAtUtc,
    Guid? FeedbackId,
    int? Intensity,
    string? BestExercise,
    int? StrengthTechnique,
    int? CardioIntensity,
    int? StretchPain,
    string? Note
);
