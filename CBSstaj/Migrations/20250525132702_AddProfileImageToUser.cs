using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CBSstaj.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileImageToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfileImageBase64",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Points",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Points_UserId",
                table: "Points",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Points_Users_UserId",
                table: "Points",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Points_Users_UserId",
                table: "Points");

            migrationBuilder.DropIndex(
                name: "IX_Points_UserId",
                table: "Points");

            migrationBuilder.DropColumn(
                name: "ProfileImageBase64",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Points");
        }
    }
}
