using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gym3000.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTrainingRestDays : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TrainingRestDays",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingRestDays", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TrainingRestDays_UserId_Date",
                table: "TrainingRestDays",
                columns: new[] { "UserId", "Date" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TrainingRestDays");
        }
    }
}
