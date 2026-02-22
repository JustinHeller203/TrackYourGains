using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Entities;

public class TrainingPlanSchedule
{
    public Guid Id { get; set; }

    [Required]
    public string UserId { get; set; } = default!;

    public Guid PlanId { get; set; }
    public TrainingPlan Plan { get; set; } = default!;

    public DateTime Date { get; set; }
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
}
