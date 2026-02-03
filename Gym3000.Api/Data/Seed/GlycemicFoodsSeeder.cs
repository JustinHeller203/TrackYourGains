using System.Text.Json;
using Gym3000.Api.Data;
using Gym3000.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gym3000.Api.Data.Seed;

public static class GlycemicFoodsSeeder
{
    private const string SeedPath = "Data/Seed/glycemic-foods.seed.json";

    public static async Task SeedAsync(ApplicationDbContext db, ILogger logger, CancellationToken ct = default)
    {
        // Wenn Tabelle schon Daten hat: nichts tun
        if (await db.GlycemicFoods.AnyAsync(ct))
        {
            logger.LogInformation("[Seed] GlycemicFoods already seeded.");
            return;
        }

        var fullPath = Path.Combine(AppContext.BaseDirectory, "Data", "Seed", "glycemic-foods.seed.json");
        if (!File.Exists(fullPath))
        {
            logger.LogWarning("[Seed] Seed file not found: {Path}", fullPath);
            return;
        }

        var json = await File.ReadAllTextAsync(fullPath, ct);

        var items = JsonSerializer.Deserialize<List<GlycemicFoodSeedItem>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        }) ?? [];

        if (items.Count == 0)
        {
            logger.LogWarning("[Seed] Seed file empty or invalid JSON.");
            return;
        }

        var now = DateTime.UtcNow;

        var entities = items.Select(x => new GlycemicFood
        {
            Key = x.Key.Trim(),
            Label = x.Label.Trim(),
            Gi = x.Gi,
            Carbs100 = x.Carbs100,
            Note = string.IsNullOrWhiteSpace(x.Note) ? null : x.Note.Trim(),
            CreatedUtc = now
        }).ToList();

        await db.GlycemicFoods.AddRangeAsync(entities, ct);
        await db.SaveChangesAsync(ct);

        logger.LogInformation("[Seed] Inserted {Count} glycemic foods.", entities.Count);
    }

    private sealed class GlycemicFoodSeedItem
    {
        public string Key { get; set; } = "";
        public string Label { get; set; } = "";
        public int Gi { get; set; }
        public decimal Carbs100 { get; set; }
        public string? Note { get; set; }
    }
}
