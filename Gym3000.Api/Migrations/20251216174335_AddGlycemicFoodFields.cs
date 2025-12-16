using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gym3000.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGlycemicFoodFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string[]>(
                name: "Aliases",
                table: "GlycemicFoods",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Calories100",
                table: "GlycemicFoods",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "GlycemicFoods",
                type: "character varying(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Fiber100",
                table: "GlycemicFoods",
                type: "numeric(6,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GiMax",
                table: "GlycemicFoods",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GiMin",
                table: "GlycemicFoods",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ServingG",
                table: "GlycemicFoods",
                type: "numeric(6,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Sugar100",
                table: "GlycemicFoods",
                type: "numeric(6,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Aliases",
                table: "GlycemicFoods");

            migrationBuilder.DropColumn(
                name: "Calories100",
                table: "GlycemicFoods");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "GlycemicFoods");

            migrationBuilder.DropColumn(
                name: "Fiber100",
                table: "GlycemicFoods");

            migrationBuilder.DropColumn(
                name: "GiMax",
                table: "GlycemicFoods");

            migrationBuilder.DropColumn(
                name: "GiMin",
                table: "GlycemicFoods");

            migrationBuilder.DropColumn(
                name: "ServingG",
                table: "GlycemicFoods");

            migrationBuilder.DropColumn(
                name: "Sugar100",
                table: "GlycemicFoods");
        }
    }
}
