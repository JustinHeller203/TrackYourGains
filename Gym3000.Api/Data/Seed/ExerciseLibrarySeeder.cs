using System.Text.Json;
using Gym3000.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gym3000.Api.Data.Seed;

public static class ExerciseLibrarySeeder
{
    public static async Task SeedAsync(ApplicationDbContext db, ILogger logger, CancellationToken ct = default)
    {
        var fullPath = Path.Combine(AppContext.BaseDirectory, "Data", "Seed", "exercise-library.seed.json");
        if (!File.Exists(fullPath))
        {
            logger.LogWarning("[Seed] ExerciseLibrary seed file not found: {Path}", fullPath);
            return;
        }

        var json = await File.ReadAllTextAsync(fullPath, ct);
        var items = JsonSerializer.Deserialize<List<ExerciseLibrarySeedItem>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        }) ?? [];

        if (items.Count == 0)
        {
            logger.LogWarning("[Seed] ExerciseLibrary seed file empty or invalid.");
            return;
        }

        var existingKeys = await db.ExerciseLibraryEntries
            .AsNoTracking()
            .Select(x => x.Key)
            .ToListAsync(ct);

        var existingKeySet = new HashSet<string>(existingKeys, StringComparer.OrdinalIgnoreCase);
        var now = DateTime.UtcNow;
        var entities = items
            .Where(item => !existingKeySet.Contains(item.Key.Trim()))
            .Select(item => new ExerciseLibraryEntry
            {
                Key = item.Key.Trim(),
                Name = item.Name.Trim(),
                PrimaryMuscleGroup = item.PrimaryMuscleGroup.Trim(),
                SecondaryMuscleGroups = NormalizeMany(item.SecondaryMuscleGroups),
                Kind = item.Kind.Trim(),
                MovementPattern = item.MovementPattern.Trim(),
                Equipment = NormalizeMany(item.Equipment),
                Level = item.Level.Trim(),
                Stability = item.Stability.Trim(),
                AxialLoad = item.AxialLoad.Trim(),
                Overhead = item.Overhead,
                DeepKneeFlexion = item.DeepKneeFlexion,
                Impact = item.Impact.Trim(),
                Rotation = item.Rotation,
                JointLoadJson = JsonSerializer.Serialize(item.JointLoad ?? new Dictionary<string, string>()),
                GoalTags = NormalizeMany(item.GoalTags),
                Substitutions = NormalizeMany(item.Substitutions),
                IsActive = true,
                CreatedUtc = now,
                Aliases = NormalizeAliases(item.Aliases)
            })
            .ToList();

        if (entities.Count == 0)
        {
            logger.LogInformation("[Seed] ExerciseLibrary already synchronized.");
            return;
        }

        await db.ExerciseLibraryEntries.AddRangeAsync(entities, ct);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("[Seed] Inserted {Count} exercise library entries.", entities.Count);
    }

    private static string[] NormalizeMany(IEnumerable<string>? values) =>
        values?
            .Select(x => x.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray()
        ?? [];

    private static List<ExerciseLibraryAlias> NormalizeAliases(IEnumerable<string>? values) =>
        values?
            .Select(x => x.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => new
            {
                Value = x,
                NormalizedValue = NormalizeAlias(x)
            })
            .Where(x => !string.IsNullOrWhiteSpace(x.NormalizedValue))
            .GroupBy(x => x.NormalizedValue, StringComparer.Ordinal)
            .Select(group => new ExerciseLibraryAlias
            {
                Value = group.First().Value,
                NormalizedValue = group.Key
            })
            .ToList()
        ?? [];

    private static string NormalizeAlias(string value)
    {
        var normalized = value.Trim().ToLowerInvariant()
            .Replace("ä", "ae")
            .Replace("ö", "oe")
            .Replace("ü", "ue")
            .Replace("ß", "ss")
            .Replace("Ã¤", "ae")
            .Replace("Ã¶", "oe")
            .Replace("Ã¼", "ue")
            .Replace("ÃŸ", "ss");

        return string.Concat(normalized.Where(char.IsLetterOrDigit));
    }

    private sealed class ExerciseLibrarySeedItem
    {
        public string Key { get; set; } = "";
        public string Name { get; set; } = "";
        public string PrimaryMuscleGroup { get; set; } = "";
        public List<string>? SecondaryMuscleGroups { get; set; }
        public string Kind { get; set; } = "strength";
        public string MovementPattern { get; set; } = "isolation";
        public List<string>? Equipment { get; set; }
        public string Level { get; set; } = "beginner";
        public string Stability { get; set; } = "stable";
        public string AxialLoad { get; set; } = "low";
        public bool Overhead { get; set; }
        public bool DeepKneeFlexion { get; set; }
        public string Impact { get; set; } = "low";
        public bool Rotation { get; set; }
        public Dictionary<string, string>? JointLoad { get; set; }
        public List<string>? GoalTags { get; set; }
        public List<string>? Substitutions { get; set; }
        public List<string>? Aliases { get; set; }
    }
}
