using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Dtos;

public class DeleteAccountDto
{
    [Required] public string Password { get; init; } = string.Empty;
}
