using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Dtos;

public class ChangePasswordDto
{
    [Required] public string CurrentPassword { get; init; } = string.Empty;
    [Required, MinLength(8)] public string NewPassword { get; init; } = string.Empty;
}
