namespace Gym3000.Api.Dtos;

public record CreateWeightEntryDto(decimal Weight, DateTime Date);

public record WeightEntryDto(int Id, decimal Weight, DateTime Date);
