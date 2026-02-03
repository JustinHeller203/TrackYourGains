//Dtos/Time/TimerDtos.cs

using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Dtos.Timers;

public record TimerDto(
    Guid Id,
    string Name,
    string SecondsPreset,
    int? CustomSeconds,
    string Sound,
    bool IsFavorite,
    bool IsVisible,
    bool ShouldStaySticky,
    int SortIndex,
    DateTime CreatedUtc,
    DateTime UpdatedUtc
);

public class UpsertTimerDto
{
    [MaxLength(64)]
    public string? Name { get; set; }

    [MaxLength(16)]
    public string? SecondsPreset { get; set; } // "60"|"90"|"120"|"custom"

    public int? CustomSeconds { get; set; }

    [MaxLength(32)]
    public string? Sound { get; set; }

    public bool? IsFavorite { get; set; }

    public bool? IsVisible { get; set; }

    public bool? ShouldStaySticky { get; set; }
}

public class ReorderTimersDto
{
    public Guid[] OrderedIds { get; set; } = Array.Empty<Guid>();
}
