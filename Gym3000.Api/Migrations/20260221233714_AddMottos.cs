using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gym3000.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMottos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Mottos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Text = table.Column<string>(type: "character varying(280)", maxLength: 280, nullable: false),
                    CreatedUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mottos", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Mottos_Text",
                table: "Mottos",
                column: "Text",
                unique: true);

            migrationBuilder.InsertData(
                table: "Mottos",
                columns: new[] { "Id", "Text", "CreatedUtc" },
                values: new object[,]
                {
                    { new Guid("9f7a6d3e-8a8a-4c4c-8f8f-1a2b3c4d5e01"), "Disziplin schlaegt Motivation.", new DateTime(2026, 2, 21, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("9f7a6d3e-8a8a-4c4c-8f8f-1a2b3c4d5e02"), "Klein starten. Konsequent bleiben.", new DateTime(2026, 2, 21, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("9f7a6d3e-8a8a-4c4c-8f8f-1a2b3c4d5e03"), "Trainiere wie die Person, die du werden willst.", new DateTime(2026, 2, 21, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("9f7a6d3e-8a8a-4c4c-8f8f-1a2b3c4d5e04"), "Heute zaehlt. Nicht irgendwann.", new DateTime(2026, 2, 21, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("9f7a6d3e-8a8a-4c4c-8f8f-1a2b3c4d5e05"), "Stark wird, wer bleibt.", new DateTime(2026, 2, 21, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("9f7a6d3e-8a8a-4c4c-8f8f-1a2b3c4d5e06"), "Fortschritt statt Perfektion.", new DateTime(2026, 2, 21, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("9f7a6d3e-8a8a-4c4c-8f8f-1a2b3c4d5e07"), "Mehr Fokus. Weniger Ausreden.", new DateTime(2026, 2, 21, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("9f7a6d3e-8a8a-4c4c-8f8f-1a2b3c4d5e08"), "Heute gewinnt das Minimum.", new DateTime(2026, 2, 21, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("9f7a6d3e-8a8a-4c4c-8f8f-1a2b3c4d5e09"), "Ein Satz ist besser als keiner.", new DateTime(2026, 2, 21, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("9f7a6d3e-8a8a-4c4c-8f8f-1a2b3c4d5e0a"), "Leise Ziele. Lauter Einsatz.", new DateTime(2026, 2, 21, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Mottos");
        }
    }
}
