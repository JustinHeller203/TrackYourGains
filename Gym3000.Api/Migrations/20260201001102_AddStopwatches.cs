using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gym3000.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStopwatches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Stopwatches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ElapsedMs = table.Column<long>(type: "bigint", nullable: false),
                    IsRunning = table.Column<bool>(type: "boolean", nullable: false),
                    StartedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsVisible = table.Column<bool>(type: "boolean", nullable: false),
                    ShouldStaySticky = table.Column<bool>(type: "boolean", nullable: false),
                    SortIndex = table.Column<int>(type: "integer", nullable: false),
                    CreatedUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stopwatches", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Stopwatches_UserId_IsVisible",
                table: "Stopwatches",
                columns: new[] { "UserId", "IsVisible" });

            migrationBuilder.CreateIndex(
                name: "IX_Stopwatches_UserId_ShouldStaySticky",
                table: "Stopwatches",
                columns: new[] { "UserId", "ShouldStaySticky" });

            migrationBuilder.CreateIndex(
                name: "IX_Stopwatches_UserId_SortIndex",
                table: "Stopwatches",
                columns: new[] { "UserId", "SortIndex" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Stopwatches");
        }
    }
}
