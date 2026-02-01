//Dtos/Time/StopwatchDtos.cs

using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Dtos.Time;

public record StopwatchDto(
    Guid Id,
    string Name,
    long ElapsedMs,
    bool IsRunning,
    DateTime? StartedAtUtc,
    bool IsVisible,
    bool ShouldStaySticky,
    int SortIndex,
    DateTime CreatedUtc,
    DateTime UpdatedUtc
);

public class UpsertStopwatchDto
{
    [MaxLength(64)]
    public string? Name { get; set; }

    // ms, kann 0.. (wir clampen)
    public long? ElapsedMs { get; set; }

    public bool? IsRunning { get; set; }

    public DateTime? StartedAtUtc { get; set; }

    public bool? IsVisible { get; set; }

    public bool? ShouldStaySticky { get; set; }
}

public class ReorderStopwatchesDto
{
    public Guid[] OrderedIds { get; set; } = Array.Empty<Guid>();
}
