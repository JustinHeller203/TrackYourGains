using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gym3000.Api.Migrations
{
    /// <inheritdoc />
    public partial class WeightEntriesAllowMultiplePerDay : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WeightEntries_UserId_Date",
                table: "WeightEntries");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                table: "WeightEntries",
                type: "timestamptz",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "date");

            migrationBuilder.CreateIndex(
                name: "IX_WeightEntries_UserId_Date",
                table: "WeightEntries",
                columns: new[] { "UserId", "Date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WeightEntries_UserId_Date",
                table: "WeightEntries");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Date",
                table: "WeightEntries",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamptz");

            migrationBuilder.CreateIndex(
                name: "IX_WeightEntries_UserId_Date",
                table: "WeightEntries",
                columns: new[] { "UserId", "Date" },
                unique: true);
        }
    }
}
