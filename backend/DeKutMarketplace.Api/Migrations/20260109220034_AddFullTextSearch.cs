using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DeKutMarketplace.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddFullTextSearch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "8e2d5330-29da-42c0-bef1-e63c48f3abf7");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "cde51a6e-1680-4dd6-9fe7-8c76a893f5e1");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "0ca95b00-82b1-45eb-89c3-49bb255524ca", null, "Admin", "ADMIN" },
                    { "f0926746-7d6c-4d7a-9483-7ef466db5165", null, "User", "USER" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "0ca95b00-82b1-45eb-89c3-49bb255524ca");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "f0926746-7d6c-4d7a-9483-7ef466db5165");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "8e2d5330-29da-42c0-bef1-e63c48f3abf7", null, "User", "USER" },
                    { "cde51a6e-1680-4dd6-9fe7-8c76a893f5e1", null, "Admin", "ADMIN" }
                });
        }
    }
}
