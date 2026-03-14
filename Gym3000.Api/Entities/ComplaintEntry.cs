using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Entities;

public class ComplaintEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string UserId { get; set; } = default!;

    [Required, MaxLength(40)]
    public string Area { get; set; } = default!;

    [Required, MaxLength(40)]
    public string Category { get; set; } = default!;

    [Required, MaxLength(20)]
    public string Status { get; set; } = "aktiv";

    public int Intensity { get; set; } = 5;

    public DateTime Date { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
