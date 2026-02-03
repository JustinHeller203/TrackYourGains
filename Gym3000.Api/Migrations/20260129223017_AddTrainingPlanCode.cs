using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gym3000.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTrainingPlanCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1) Spalte erstmal nullable, KEIN default
            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "TrainingPlans",
                type: "character varying(12)",
                maxLength: 12,
                nullable: true);

            // 2) Backfill für bestehende Daten (12 chars, genau 1 special '-', mind. 1 upper/lower/digit)
            migrationBuilder.Sql(@"
UPDATE ""TrainingPlans""
SET ""Code"" =
    (substr('ABCDEFGHJKLMNPQRSTUVWXYZ', floor(random()*24)::int + 1, 1)) ||
    (substr('abcdefghijkmnpqrstuvwxyz', floor(random()*24)::int + 1, 1)) ||
    (substr('23456789',                 floor(random()*8 )::int + 1, 1)) ||
    (SELECT string_agg(
        substr('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789',
               floor(random()*56)::int + 1, 1),
        ''
     )
     FROM generate_series(1, 8)
    ) ||
    '-'
WHERE ""Code"" IS NULL OR ""Code"" = '';
");

            // 3) Jetzt NOT NULL erzwingen
            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "TrainingPlans",
                type: "character varying(12)",
                maxLength: 12,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(12)",
                oldMaxLength: 12,
                oldNullable: true);

            // 4) Und erst jetzt Unique Index
            migrationBuilder.CreateIndex(
                name: "IX_TrainingPlans_Code",
                table: "TrainingPlans",
                column: "Code",
                unique: true);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TrainingPlans_Code",
                table: "TrainingPlans");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "TrainingPlans");
        }
    }
}
