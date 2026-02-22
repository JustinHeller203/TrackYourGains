// Gym3000.Api/Entities/UserMeta.cs
using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Entities;

public class UserMeta
{
    [Key] public string UserId { get; set; } = default!;
    public int TokenVersion { get; set; } = 0;
    public bool HasCreatedTrainingPlan { get; set; } = false;
}
