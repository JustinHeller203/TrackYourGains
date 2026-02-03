using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Entities;

public class TrainingPlan
{
    public Guid Id { get; set; }

    [Required]
    public string UserId { get; set; } = default!;

    [Required, MaxLength(120)]
    public string Name { get; set; } = default!;

    public bool IsFavorite { get; set; }

    [Required, MaxLength(12)]
    public string Code { get; set; } = default!;

    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedUtc { get; set; } = DateTime.UtcNow;

    public List<TrainingDay> Days { get; set; } = new();
}
