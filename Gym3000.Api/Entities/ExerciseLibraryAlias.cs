using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Entities;

public class ExerciseLibraryAlias
{
    public int Id { get; set; }

    public int ExerciseLibraryEntryId { get; set; }
    public ExerciseLibraryEntry Exercise { get; set; } = default!;

    [Required, MaxLength(160)]
    public string Value { get; set; } = default!;

    [Required, MaxLength(180)]
    public string NormalizedValue { get; set; } = default!;
}
