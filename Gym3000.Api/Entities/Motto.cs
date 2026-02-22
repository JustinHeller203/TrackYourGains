using System.ComponentModel.DataAnnotations;

namespace Gym3000.Api.Entities;

public class Motto
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(280)]
    public string Text { get; set; } = string.Empty;

    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
}
