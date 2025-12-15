using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Gym3000.Api.Entities;

namespace Gym3000.Api.Data;

public class ApplicationDbContext : IdentityDbContext<IdentityUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<WeightEntry> WeightEntries => Set<WeightEntry>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<UserMeta> UserMetas => Set<UserMeta>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<GlycemicFood> GlycemicFoods => Set<GlycemicFood>();

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
             .HasColumnType("date");

            // Pro User nur ein Eintrag pro Datum
            e.HasIndex(x => new { x.UserId, x.Date })
             .IsUnique();
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

    }
}
