using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gym3000.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTimers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Timers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    SecondsPreset = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    CustomSeconds = table.Column<int>(type: "integer", nullable: true),
                    Sound = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    IsFavorite = table.Column<bool>(type: "boolean", nullable: false),
                    IsVisible = table.Column<bool>(type: "boolean", nullable: false),
                    ShouldStaySticky = table.Column<bool>(type: "boolean", nullable: false),
                    SortIndex = table.Column<int>(type: "integer", nullable: false),
                    CreatedUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Timers", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Timers_UserId_IsFavorite",
                table: "Timers",
                columns: new[] { "UserId", "IsFavorite" });

            migrationBuilder.CreateIndex(
                name: "IX_Timers_UserId_SortIndex",
                table: "Timers",
                columns: new[] { "UserId", "SortIndex" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Timers");
        }
    }
}
