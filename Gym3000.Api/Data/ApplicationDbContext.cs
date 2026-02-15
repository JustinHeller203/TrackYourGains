using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Gym3000.Api.Entities;
using TimerEntity = Gym3000.Api.Entities.Time.Timer;
using StopwatchEntity = Gym3000.Api.Entities.Time.Stopwatch;

namespace Gym3000.Api.Data;

public class ApplicationDbContext : IdentityDbContext<IdentityUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<WeightEntry> WeightEntries => Set<WeightEntry>();
    public DbSet<GoalWeight> GoalWeights => Set<GoalWeight>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<UserMeta> UserMetas => Set<UserMeta>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<GlycemicFood> GlycemicFoods => Set<GlycemicFood>();
    public DbSet<TrainingPlan> TrainingPlans => Set<TrainingPlan>();
    public DbSet<TrainingDay> TrainingDays => Set<TrainingDay>();
    public DbSet<TrainingExercise> TrainingExercises => Set<TrainingExercise>();
    public DbSet<ProgressEntry> ProgressEntries => Set<ProgressEntry>();
    public DbSet<TimerEntity> Timers => Set<TimerEntity>();
    public DbSet<StopwatchEntity> Stopwatches => Set<StopwatchEntity>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // -------- WeightEntry --------
        builder.Entity<WeightEntry>(e =>
        {
            e.HasKey(x => x.Id);

            e.Property(x => x.UserId)
             .IsRequired();

            // numeric(6,2) für z. B. 9999.99 – reicht locker für Körpergewicht
            e.Property(x => x.Weight)
             .HasPrecision(6, 2);

            // Postgres 'date' (ohne Uhrzeit)
            e.Property(x => x.Date)
 .HasColumnType("timestamptz");

            // Mehrere Einträge pro Tag erlaubt -> KEIN Unique Index
            e.HasIndex(x => new { x.UserId, x.Date });
        });

        // -------- GoalWeight --------
        builder.Entity<GoalWeight>(e =>
        {
            e.HasKey(x => x.Id);

            e.Property(x => x.UserId)
             .IsRequired()
             .HasMaxLength(64);

            e.Property(x => x.GoalKg)
             .HasPrecision(6, 2);

            e.Property(x => x.UpdatedUtc).IsRequired();

            // 1 Row pro User
            e.HasIndex(x => x.UserId).IsUnique();
        });

        // -------- RefreshToken (Rotation/Reuse-Detection) --------
        builder.Entity<RefreshToken>(e =>
        {
            e.HasKey(x => x.Id);

            e.Property(x => x.UserId).IsRequired();

            e.Property(x => x.FamilyId).IsRequired().HasMaxLength(64);
            e.Property(x => x.DeviceId).HasMaxLength(64);

            e.Property(x => x.TokenHash).IsRequired().HasMaxLength(128);
            e.Property(x => x.Salt).IsRequired().HasMaxLength(64);

            e.Property(x => x.UserAgent).HasMaxLength(512);
            e.Property(x => x.CreatedByIp).HasMaxLength(64);
            e.Property(x => x.LastSeenIp).HasMaxLength(64);
            e.Property(x => x.JwtId).HasMaxLength(64);

            e.Property(x => x.ExpiresAtUtc).IsRequired();

            // Suche/Integrität
            e.HasIndex(x => x.TokenHash).IsUnique();
            e.HasIndex(x => new { x.UserId, x.FamilyId });
            e.HasIndex(x => x.ExpiresAtUtc);

            // Genau 1 aktueller Token pro (User, Device, Family)
            e.HasIndex(x => new { x.UserId, x.DeviceId, x.FamilyId, x.IsCurrent }).IsUnique();
        });

        // -------- UserMeta (Token-Versionierung) --------
        builder.Entity<UserMeta>(e =>
        {
            e.HasKey(x => x.UserId);

            e.Property(x => x.TokenVersion)
             .HasDefaultValue(0);
        });

        // -------- AuditLog --------
        builder.Entity<AuditLog>(e =>
        {
            e.HasKey(a => a.Id);

            e.Property(a => a.Action)
             .HasMaxLength(64)
             .IsRequired();

            e.Property(a => a.UserId)
             .HasMaxLength(64);

            e.Property(a => a.Ip)
             .HasMaxLength(64);

            e.Property(a => a.UserAgent)
             .HasMaxLength(256);

            e.Property(a => a.Meta)
             .HasMaxLength(512);

            e.Property(a => a.CreatedUtc)
             .IsRequired();

            e.HasIndex(a => a.CreatedUtc);
            e.HasIndex(a => new { a.UserId, a.Action, a.CreatedUtc });
        });

        // -------- GlycemicFood (GI / Carbs Table) --------
        builder.Entity<GlycemicFood>(e =>
        {
            e.HasKey(x => x.Id);

            e.Property(x => x.Key)
             .IsRequired()
             .HasMaxLength(80);

            e.Property(x => x.Label)
             .IsRequired()
             .HasMaxLength(160);

            e.Property(x => x.Gi)
             .IsRequired();

            e.Property(x => x.Carbs100)
             .IsRequired()
             .HasPrecision(6, 2);

            e.Property(x => x.Note)
             .HasMaxLength(220);

            e.Property(x => x.CreatedUtc)
             .IsRequired();

            e.HasIndex(x => x.Key).IsUnique();
            e.HasIndex(x => x.Label);
        });

        // -------- TrainingPlan / Day / Exercise --------
        builder.Entity<TrainingPlan>(e =>
        {
            e.HasKey(x => x.Id);

            e.Property(x => x.UserId).IsRequired();

            e.Property(x => x.Name)
             .IsRequired()
             .HasMaxLength(120);

            e.Property(x => x.Code)
             .IsRequired()
             .HasMaxLength(12);

            e.HasIndex(x => x.Code).IsUnique();

            e.Property(x => x.CreatedUtc).IsRequired();
            e.Property(x => x.UpdatedUtc).IsRequired();

            // pro User keine doppelten Plan-Namen (wenn du das nicht willst -> sag, dann mach ich’s nur als normaler Index)
            e.HasIndex(x => new { x.UserId, x.Name }).IsUnique();

            e.HasMany(x => x.Days)
             .WithOne(x => x.Plan)
             .HasForeignKey(x => x.PlanId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<TrainingDay>(e =>
        {
            e.HasKey(x => x.Id);

            e.Property(x => x.Name)
             .IsRequired()
             .HasMaxLength(120);

            e.HasIndex(x => new { x.PlanId, x.SortOrder });

            e.HasMany(x => x.Exercises)
             .WithOne(x => x.Day)
             .HasForeignKey(x => x.DayId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<TrainingExercise>(e =>
        {
            e.HasKey(x => x.Id);

            e.Property(x => x.Name)
             .IsRequired()
             .HasMaxLength(160);

            e.Property(x => x.Notes)
             .HasMaxLength(600);

            // decimals sauber für Postgres
            e.Property(x => x.TargetWeight).HasPrecision(6, 2);
            e.Property(x => x.DistanceKm).HasPrecision(6, 2);

            e.HasIndex(x => new { x.DayId, x.SortOrder });
            e.HasIndex(x => x.Category);
        });

        // -------- ProgressEntry (Plan-Fortschritt) --------
        builder.Entity<ProgressEntry>(e =>
        {
            e.HasKey(x => x.Id);

            e.Property(x => x.UserId).IsRequired();

            e.Property(x => x.Date)
             .HasColumnType("date");

            e.Property(x => x.Exercise)
             .IsRequired()
             .HasMaxLength(160);

            e.Property(x => x.Note)
             .HasMaxLength(800);

            e.Property(x => x.Tempo)
             .HasMaxLength(40);

            e.Property(x => x.WeightKg)
             .HasPrecision(6, 2);

            e.Property(x => x.DistanceKm)
             .HasPrecision(6, 2);

            // Enum als string speichern (lesbarer in DB)
            e.Property(x => x.Type)
             .HasConversion<string>()
             .HasMaxLength(32);

            e.HasOne(x => x.Plan)
             .WithMany()
             .HasForeignKey(x => x.PlanId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(x => new { x.UserId, x.PlanId, x.Date });
            e.HasIndex(x => new { x.UserId, x.PlanId, x.Exercise });
        });

        // -------- Timers (Satzpausen-Timer) --------
        builder.Entity<TimerEntity>(e =>
        {
            e.HasKey(x => x.Id);

            e.Property(x => x.UserId).IsRequired();

            e.Property(x => x.Name)
             .IsRequired()
             .HasMaxLength(64);

            e.Property(x => x.SecondsPreset)
             .IsRequired()
             .HasMaxLength(16);

            e.Property(x => x.Sound)
             .IsRequired()
             .HasMaxLength(32);

            e.Property(x => x.CreatedUtc).IsRequired();
            e.Property(x => x.UpdatedUtc).IsRequired();

            e.HasIndex(x => new { x.UserId, x.SortIndex });
            e.HasIndex(x => new { x.UserId, x.IsFavorite });
        });
        builder.Entity<StopwatchEntity>(e =>
        {
            e.HasKey(x => x.Id);

            e.Property(x => x.UserId).IsRequired();

            e.Property(x => x.Name)
             .IsRequired()
             .HasMaxLength(64);

            e.Property(x => x.CreatedUtc).IsRequired();
            e.Property(x => x.UpdatedUtc).IsRequired();

            e.HasIndex(x => new { x.UserId, x.SortIndex });
            e.HasIndex(x => new { x.UserId, x.ShouldStaySticky });
            e.HasIndex(x => new { x.UserId, x.IsVisible });
        });

        builder.Entity<UserSettings>(e =>
        {
            e.HasKey(x => x.Id);

            e.Property(x => x.UserId).IsRequired().HasMaxLength(64);

            e.Property(x => x.Theme).IsRequired().HasMaxLength(10);
            e.Property(x => x.PreferredUnit).IsRequired().HasMaxLength(10);

            e.Property(x => x.ToastTypeEnabledJson).HasMaxLength(4096);

            e.Property(x => x.UpdatedUtc).IsRequired();

            // 1 Settings Row pro User
            e.HasIndex(x => x.UserId).IsUnique();
        });
    }
}
