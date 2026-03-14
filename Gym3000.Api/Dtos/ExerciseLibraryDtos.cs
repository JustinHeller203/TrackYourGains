namespace Gym3000.Api.Dtos;

public record ExerciseLibraryEntryDto(
    int Id,
    string Key,
    string Name,
    string PrimaryMuscleGroup,
    string[] SecondaryMuscleGroups,
    string Kind,
    string MovementPattern,
    string[] Equipment,
    string Level,
    string Stability,
    string AxialLoad,
    bool Overhead,
    bool DeepKneeFlexion,
    string Impact,
    bool Rotation,
    Dictionary<string, string> JointLoad,
    string[] GoalTags,
    string[] Substitutions,
    string[] Aliases
);
