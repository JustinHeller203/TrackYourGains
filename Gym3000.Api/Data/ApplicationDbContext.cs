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

        // -------- RefreshToken --------
        builder.Entity<RefreshToken>(e =>
        {
            e.HasKey(x => x.Id);

            e.Property(x => x.UserId)
             .IsRequired();

            // Base64(SHA256) ist 44 Zeichen – wir lassen 88 für Spielraum (kein Breaking Change)
            e.Property(x => x.TokenHash)
             .IsRequired()
             .HasMaxLength(88);

            e.Property(x => x.ExpiresAtUtc)
             .IsRequired();

            e.HasIndex(x => new { x.UserId, x.TokenHash })
             .IsUnique();

            e.HasIndex(x => x.ExpiresAtUtc);
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
    }
}
