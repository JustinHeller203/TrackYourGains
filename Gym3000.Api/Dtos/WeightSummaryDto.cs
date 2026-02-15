namespace Gym3000.Api.Dtos;

public record WeightSummaryDto(decimal? LatestKg, DateTime? LatestDate, decimal? GoalKg);

public record SetGoalWeightDto(decimal? GoalKg);
