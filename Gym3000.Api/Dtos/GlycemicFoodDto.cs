//FGlycemicFoodDto.cs

namespace Gym3000.Api.Dtos;

public record GlycemicFoodDto(
    int Id,
    string Key,
    string Label,
    string Category,
    int? Gi,
    int? GiMin,
    int? GiMax,
    decimal? Carbs100,
    decimal? ServingG,
    decimal? Fiber100,
    decimal? Sugar100,
    int? Calories100,
    string[]? Aliases,
    string? Note
);
