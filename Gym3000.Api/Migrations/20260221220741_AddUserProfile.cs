using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gym3000.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserProfiles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    DisplayName = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Motto = table.Column<string>(type: "character varying(280)", maxLength: 280, nullable: false),
                    AvatarDataUrl = table.Column<string>(type: "text", nullable: true),
                    ActivityJson = table.Column<string>(type: "text", nullable: false),
                    ProgressJson = table.Column<string>(type: "text", nullable: false),
                    GoalOrderJson = table.Column<string>(type: "text", nullable: false),
                    EarnedBadgesJson = table.Column<string>(type: "text", nullable: false),
                    FavoriteTimers = table.Column<int>(type: "integer", nullable: false),
                    MemberSinceUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfiles", x => x.UserId);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserProfiles");
        }
    }
}
