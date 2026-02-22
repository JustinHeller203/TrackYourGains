using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gym3000.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTrainingPlannerAndPlanColor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "TrainingPlans",
                type: "character varying(16)",
                maxLength: 16,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TrainingPlanSchedules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    PlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingPlanSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingPlanSchedules_TrainingPlans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "TrainingPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TrainingPlanSchedules_PlanId",
                table: "TrainingPlanSchedules",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingPlanSchedules_UserId_Date",
                table: "TrainingPlanSchedules",
                columns: new[] { "UserId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_TrainingPlanSchedules_UserId_PlanId_Date",
                table: "TrainingPlanSchedules",
                columns: new[] { "UserId", "PlanId", "Date" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TrainingPlanSchedules");

            migrationBuilder.DropColumn(
                name: "Color",
                table: "TrainingPlans");
        }
    }
}
