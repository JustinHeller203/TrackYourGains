using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Dtos;

public class LoginDto
{
    [Required, EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    public string Password { get; init; } = string.Empty;
}
