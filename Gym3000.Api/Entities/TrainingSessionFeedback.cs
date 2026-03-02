using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Entities;

public class TrainingSessionFeedback
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid SessionId { get; set; }
    public TrainingSession Session { get; set; } = default!;

    [Required]
    public string UserId { get; set; } = default!;

    public Guid PlanId { get; set; }

    public DateTime CreatedUtc { get; set; }

    public int? Intensity { get; set; }

    [MaxLength(160)]
    public string? BestExercise { get; set; }

    public int? StrengthTechnique { get; set; }
    public int? CardioIntensity { get; set; }
    public int? StretchPain { get; set; }

    [MaxLength(800)]
    public string? Note { get; set; }
}
