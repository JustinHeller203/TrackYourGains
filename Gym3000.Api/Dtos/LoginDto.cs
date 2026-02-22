using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Dtos;

public class LoginDto
{
    [Required, MinLength(3), MaxLength(20)]
    public string Username { get; init; } = string.Empty;

    [Required]
    public string Password { get; init; } = string.Empty;
}
