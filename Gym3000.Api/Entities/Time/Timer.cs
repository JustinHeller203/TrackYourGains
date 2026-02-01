//Entities/Time/Timer.cs

namespace Gym3000.Api.Entities.Time;

public class Timer
{
    public Guid Id { get; set; }

    public string UserId { get; set; } = default!;

    public string Name { get; set; } = "Timer";

    // "60" | "90" | "120" | "custom"
    public string SecondsPreset { get; set; } = "60";

    public int? CustomSeconds { get; set; }

    public string Sound { get; set; } = "standard";

    public bool IsFavorite { get; set; }

    public bool IsVisible { get; set; } = true;

    public bool ShouldStaySticky { get; set; }

    public int SortIndex { get; set; }

    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedUtc { get; set; } = DateTime.UtcNow;
}
