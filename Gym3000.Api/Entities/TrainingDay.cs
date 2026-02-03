using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Entities;

public class TrainingDay
{
    public Guid Id { get; set; }

    public Guid PlanId { get; set; }
    public TrainingPlan Plan { get; set; } = default!;

    [Required, MaxLength(120)]
    public string Name { get; set; } = default!;

    public int SortOrder { get; set; }

    public List<TrainingExercise> Exercises { get; set; } = new();
}
