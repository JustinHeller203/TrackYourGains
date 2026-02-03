//Entities/Time/Stopwatch.cs

using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Entities.Time;

public class Stopwatch
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(64)]
    public string UserId { get; set; } = default!;

    [Required]
    [MaxLength(64)]
    public string Name { get; set; } = "Stoppuhr";

    // Persistierter Stand in Millisekunden
    public long ElapsedMs { get; set; } = 0;

    // Laufzustand
    public bool IsRunning { get; set; } = false;

    // Wenn running: ab wann läuft sie (UTC) – optional, aber super für korrektes Resume
    public DateTime? StartedAtUtc { get; set; }

    public bool IsVisible { get; set; } = true;
    public bool ShouldStaySticky { get; set; } = false;

    // Reihenfolge im UI
    public int SortIndex { get; set; } = 0;

    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedUtc { get; set; } = DateTime.UtcNow;
}
