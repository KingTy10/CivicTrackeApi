using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CivicTrack.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddReporterEmailToServiceRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ReporterEmail",
                table: "ServiceRequests",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReporterEmail",
                table: "ServiceRequests");
        }
    }
}
