using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Gym3000.Api.Entities;

public class ExerciseLibraryEntry
{
    public int Id { get; set; }

    [Required, MaxLength(120)]
    public string Key { get; set; } = default!;

    [Required, MaxLength(160)]
    public string Name { get; set; } = default!;

    [Required, MaxLength(80)]
    public string PrimaryMuscleGroup { get; set; } = default!;

    [Column(TypeName = "text[]")]
    public string[] SecondaryMuscleGroups { get; set; } = [];

    [Required, MaxLength(40)]
    public string Kind { get; set; } = "strength";

    [Required, MaxLength(40)]
    public string MovementPattern { get; set; } = "isolation";

    [Column(TypeName = "text[]")]
    public string[] Equipment { get; set; } = [];

    [Required, MaxLength(32)]
    public string Level { get; set; } = "beginner";

    [Required, MaxLength(32)]
    public string Stability { get; set; } = "stable";

    [Required, MaxLength(32)]
    public string AxialLoad { get; set; } = "low";

    public bool Overhead { get; set; }
    public bool DeepKneeFlexion { get; set; }

    [Required, MaxLength(32)]
    public string Impact { get; set; } = "low";

    public bool Rotation { get; set; }

    [Column(TypeName = "jsonb")]
    public string JointLoadJson { get; set; } = "{}";

    [Column(TypeName = "text[]")]
    public string[] GoalTags { get; set; } = [];

    [Column(TypeName = "text[]")]
    public string[] Substitutions { get; set; } = [];

    public bool IsActive { get; set; } = true;
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;

    public List<ExerciseLibraryAlias> Aliases { get; set; } = new();
}
