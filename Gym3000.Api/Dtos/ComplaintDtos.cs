using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Dtos;

public record ComplaintEntryDto(
    Guid Id,
    string Area,
    string Category,
    string Status,
    int Intensity,
    DateTime Date,
    string? Notes,
    DateTime CreatedAt
);

public class CreateComplaintEntryDto
{
    [Required, MaxLength(40)] public string Area { get; init; } = string.Empty;
    [Required, MaxLength(40)] public string Category { get; init; } = string.Empty;
    [Required, MaxLength(20)] public string Status { get; init; } = "aktiv";
    [Required] public int Intensity { get; init; } = 5;
    [Required] public DateTime Date { get; init; }
    [MaxLength(400)] public string? Notes { get; init; }
}

public class UpdateComplaintStatusDto
{
    [Required, MaxLength(20)] public string Status { get; init; } = "aktiv";
}
