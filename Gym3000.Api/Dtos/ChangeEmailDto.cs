using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Dtos;

public class ChangeEmailDto
{
    [Required, EmailAddress] public string NewEmail { get; init; } = string.Empty;
    [Required] public string Password { get; init; } = string.Empty;
}
