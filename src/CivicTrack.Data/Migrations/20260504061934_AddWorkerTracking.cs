using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CivicTrack.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkerTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AssignedWorkerId",
                table: "ServiceRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequestedByWorkerId",
                table: "ServiceRequests",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedWorkerId",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "RequestedByWorkerId",
                table: "ServiceRequests");
        }
    }
}
