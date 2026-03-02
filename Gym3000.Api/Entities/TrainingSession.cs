using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Entities;

public class TrainingSession
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string UserId { get; set; } = default!;

    public Guid PlanId { get; set; }
    public TrainingPlan Plan { get; set; } = default!;

    public DateTime? StartedAtUtc { get; set; }
    public DateTime FinishedAtUtc { get; set; }
    public DateTime CreatedUtc { get; set; }

    public int? DurationSec { get; set; }
    public int? ExercisesTotal { get; set; }
    public int? ExercisesDone { get; set; }

    [MaxLength(80)]
    public string? TypesPresent { get; set; }

    public TrainingSessionFeedback? Feedback { get; set; }
}
