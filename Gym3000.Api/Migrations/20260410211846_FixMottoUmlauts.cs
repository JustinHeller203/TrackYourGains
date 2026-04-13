using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gym3000.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixMottoUmlauts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "Mottos"
                SET "Text" = 'Disziplin schlägt Motivation.'
                WHERE "Text" = 'Disziplin schlaegt Motivation.';

                UPDATE "Mottos"
                SET "Text" = 'Heute zählt. Nicht irgendwann.'
                WHERE "Text" = 'Heute zaehlt. Nicht irgendwann.';
            """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "Mottos"
                SET "Text" = 'Disziplin schlaegt Motivation.'
                WHERE "Text" = 'Disziplin schlägt Motivation.';

                UPDATE "Mottos"
                SET "Text" = 'Heute zaehlt. Nicht irgendwann.'
                WHERE "Text" = 'Heute zählt. Nicht irgendwann.';
            """);
        }
    }
}
