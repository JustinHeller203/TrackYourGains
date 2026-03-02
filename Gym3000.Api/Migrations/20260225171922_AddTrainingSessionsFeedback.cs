using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gym3000.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTrainingSessionsFeedback : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TrainingSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    PlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartedAtUtc = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    FinishedAtUtc = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    CreatedUtc = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    DurationSec = table.Column<int>(type: "integer", nullable: true),
                    ExercisesTotal = table.Column<int>(type: "integer", nullable: true),
                    ExercisesDone = table.Column<int>(type: "integer", nullable: true),
                    TypesPresent = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingSessions_TrainingPlans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "TrainingPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TrainingSessionFeedbacks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    PlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedUtc = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    Intensity = table.Column<int>(type: "integer", nullable: true),
                    BestExercise = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: true),
                    StrengthTechnique = table.Column<int>(type: "integer", nullable: true),
                    CardioIntensity = table.Column<int>(type: "integer", nullable: true),
                    StretchPain = table.Column<int>(type: "integer", nullable: true),
                    Note = table.Column<string>(type: "character varying(800)", maxLength: 800, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingSessionFeedbacks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingSessionFeedbacks_TrainingSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "TrainingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TrainingSessionFeedbacks_SessionId",
                table: "TrainingSessionFeedbacks",
                column: "SessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrainingSessionFeedbacks_UserId_PlanId_CreatedUtc",
                table: "TrainingSessionFeedbacks",
                columns: new[] { "UserId", "PlanId", "CreatedUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_TrainingSessions_PlanId",
                table: "TrainingSessions",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingSessions_UserId_FinishedAtUtc",
                table: "TrainingSessions",
                columns: new[] { "UserId", "FinishedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_TrainingSessions_UserId_PlanId_FinishedAtUtc",
                table: "TrainingSessions",
                columns: new[] { "UserId", "PlanId", "FinishedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TrainingSessionFeedbacks");

            migrationBuilder.DropTable(
                name: "TrainingSessions");
        }
    }
}
