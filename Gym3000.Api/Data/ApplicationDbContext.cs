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

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<WeightEntry>(e =>
        {
            e.HasKey(x => x.Id);

            // UserId Pflichtfeld
            e.Property(x => x.UserId)
             .IsRequired();

            // Gewicht als numeric(6,2)
            e.Property(x => x.Weight)
             .HasPrecision(6, 2);

            // Datum ohne Uhrzeit
            e.Property(x => x.Date)
             .HasColumnType("date");

            // Jeder User darf nur einen Eintrag pro Datum haben
            e.HasIndex(x => new { x.UserId, x.Date })
             .IsUnique();
        });
    }
}
