using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Dtos;

public class CheckRegisterEmailDto
{
    [Required, EmailAddress]
    public string Email { get; init; } = string.Empty;
}
