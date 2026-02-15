using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gym3000.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Theme = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    PreferredUnit = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    AutoCalcEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    ConfirmDeleteEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    BackToTopEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    StickyTimerEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    StickyStopwatchEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    ToastsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    ToastDurationMs = table.Column<int>(type: "integer", nullable: false),
                    ToastTypeEnabledJson = table.Column<string>(type: "character varying(4096)", maxLength: 4096, nullable: false),
                    UpdatedUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSettings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserSettings_UserId",
                table: "UserSettings",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserSettings");
        }
    }
}
