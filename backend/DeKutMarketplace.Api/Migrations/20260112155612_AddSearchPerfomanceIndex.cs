using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeKutMarketplace.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSearchPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Index on Products.Name for search queries
            // LIKE '%term%' queries don't use indexes, but 'term%' does
            // This helps when users search for product names starting with a term
            migrationBuilder.CreateIndex(
                name: "IX_Products_Name",
                table: "Products",
                column: "Name");

            // Index on Products.Location for location-based filtering
            migrationBuilder.CreateIndex(
                name: "IX_Products_Location",
                table: "Products",
                column: "Location");

            // Composite index for common filter combinations
            // Price range filters + Status are frequently used together
            migrationBuilder.CreateIndex(
                name: "IX_Products_Price_Status",
                table: "Products",
                columns: new[] { "Price", "Status" });

            // Index on Products.Condition for condition filtering
            migrationBuilder.CreateIndex(
                name: "IX_Products_Condition",
                table: "Products",
                column: "Condition");

            // Index on Products.Negotiable for negotiable filtering
            migrationBuilder.CreateIndex(
                name: "IX_Products_Negotiable",
                table: "Products",
                column: "Negotiable");

            // Index on Categories.Name for category search
            migrationBuilder.CreateIndex(
                name: "IX_Categories_Name",
                table: "Categories",
                column: "Name");

            // Composite index for published products sorted by date (most common query)
            migrationBuilder.CreateIndex(
                name: "IX_Products_Status_CreatedAt",
                table: "Products",
                columns: new[] { "Status", "CreatedAt" },
                descending: new[] { false, true }); // Status ASC, CreatedAt DESC
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Products_Name",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_Location",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_Price_Status",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_Condition",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_Negotiable",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Categories_Name",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Products_Status_CreatedAt",
                table: "Products");
        }
    }
}