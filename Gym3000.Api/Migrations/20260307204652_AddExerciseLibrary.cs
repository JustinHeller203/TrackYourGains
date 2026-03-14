using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Gym3000.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddExerciseLibrary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExerciseLibraryEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Key = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    PrimaryMuscleGroup = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    SecondaryMuscleGroups = table.Column<string[]>(type: "text[]", nullable: false),
                    Kind = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    MovementPattern = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Equipment = table.Column<string[]>(type: "text[]", nullable: false),
                    Level = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Stability = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    AxialLoad = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Overhead = table.Column<bool>(type: "boolean", nullable: false),
                    DeepKneeFlexion = table.Column<bool>(type: "boolean", nullable: false),
                    Impact = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Rotation = table.Column<bool>(type: "boolean", nullable: false),
                    JointLoadJson = table.Column<string>(type: "jsonb", nullable: false),
                    GoalTags = table.Column<string[]>(type: "text[]", nullable: false),
                    Substitutions = table.Column<string[]>(type: "text[]", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedUtc = table.Column<DateTime>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExerciseLibraryEntries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExerciseLibraryAliases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExerciseLibraryEntryId = table.Column<int>(type: "integer", nullable: false),
                    Value = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    NormalizedValue = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExerciseLibraryAliases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExerciseLibraryAliases_ExerciseLibraryEntries_ExerciseLibra~",
                        column: x => x.ExerciseLibraryEntryId,
                        principalTable: "ExerciseLibraryEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseLibraryAliases_ExerciseLibraryEntryId_NormalizedVal~",
                table: "ExerciseLibraryAliases",
                columns: new[] { "ExerciseLibraryEntryId", "NormalizedValue" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseLibraryAliases_NormalizedValue",
                table: "ExerciseLibraryAliases",
                column: "NormalizedValue");

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseLibraryEntries_Key",
                table: "ExerciseLibraryEntries",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseLibraryEntries_Name",
                table: "ExerciseLibraryEntries",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseLibraryEntries_PrimaryMuscleGroup_IsActive",
                table: "ExerciseLibraryEntries",
                columns: new[] { "PrimaryMuscleGroup", "IsActive" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExerciseLibraryAliases");

            migrationBuilder.DropTable(
                name: "ExerciseLibraryEntries");
        }
    }
}
