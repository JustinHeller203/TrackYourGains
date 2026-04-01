using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gym3000.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTutorialPreferenceFieldsToUserProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TutorialFavoriteIdsJson",
                table: "UserProfiles",
                type: "text",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "TutorialRecentViewedJson",
                table: "UserProfiles",
                type: "text",
                nullable: false,
                defaultValue: "{}");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TutorialFavoriteIdsJson",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "TutorialRecentViewedJson",
                table: "UserProfiles");
        }
    }
}
