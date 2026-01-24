using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Dtos;

public class RegisterDto
{
	[Required, EmailAddress]
	public string Email { get; init; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; init; } = string.Empty;

}
