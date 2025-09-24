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

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<WeightEntry>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.UserId).IsRequired();
            e.Property(x => x.Weight).HasPrecision(6, 2);
            e.Property(x => x.Date).HasColumnType("date");
            e.HasIndex(x => new { x.UserId, x.Date }).IsUnique();
        });

        builder.Entity<RefreshToken>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.UserId).IsRequired();
            e.Property(x => x.TokenHash).IsRequired().HasMaxLength(88);
            e.HasIndex(x => new { x.UserId, x.TokenHash }).IsUnique();
        });

        builder.Entity<UserMeta>(e =>
        {
            e.HasKey(x => x.UserId);
            e.Property(x => x.TokenVersion).HasDefaultValue(0);
        });
    }
}
