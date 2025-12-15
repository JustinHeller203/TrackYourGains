namespace Gym3000.Api.Dtos;

public record GlycemicFoodDto(
    int Id,
    string Key,
    string Label,
    int Gi,
    decimal Carbs100,
    string? Note
);
