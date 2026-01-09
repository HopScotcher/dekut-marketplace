using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DekutMarketplace.Api.Migrations{
    public partial class AddFullTextSearch : Migration{
        protected override void Up(MigrationBuilder migrationBuilder){
            // create full text catalog
            migrationBuilder.Sql(@"IF NOT EXISTS (SELECT * FROM sys.fulltext_catalogs WHERE NAME = 'MarketplaceCatalog')
            BEGIN 
                CREATE FULLTEXT CATALOG MarketplaceCatalog AS DEFAULT;
            END
        ");

        migrationBuilder.Sql(@"
        -- ensuree the products table has a unique index (e.g the Id primary key)
        IF NOT EXISTS (
            SELECT * FROM sys.fulltext_indexes
            WHERE object_id == OBJECT_ID('Products')
        )
        BEGIN
            CREATE FULLTEXT INDEX ON Products(
                Name LANGUAGE 1033,  --Product name (most important)
                Description LANGUAGE 1033, -- Full description
                Location LANGUAGE 1033, -- Location text
                Tags LANGUAGE 1033 -- JSON array of tags
            )

            KEY INDEX PK_Products
            ON MarketplaceCatalog
            WITH CHANGE_TRACKING AUTO;
        END
        ");

        // create full-text index on categories table
        migrationBuilder.Sql(@"
        IF NOT EXISTS(
        SELECT * FROM sys.fulltext_indexes
        WHERE object_id = OBJECT_ID('Categories'))
        BEGIN 
            CREATE FULLTEXT INDEX ON Categories (
            Name LANGUAGE 1033,
            Description LANGUAGE 1033
        )
        KEY INDEX PK_Categories   -- reference to primary key Id
        ON MarketplaceCatalog     -- use the same catalog
        WITH CHANGE_TRACKING AUTO;
    END
        ");

        // start full population of the indexes
        migrationBuilder.Sql(@"
        ALTER FULLTEXT INDEX ON Products START FULL POPULATION;
        ALTER FULLTEXT INDEX ON Categories START FULL POPULATION;
        ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
            IF EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Products')
            BEGIN 
                DROP FULLTEXT INDEX ON Products;
            END)");

            migrationBuilder.Sql(@"
            IF EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Categories')
            BEGIN 
                DROP FULLTEXT INDEX ON Categories;
            END");

            migrationBuilder.Sql(@"
            IF EXISTS (SELECT * FROM sys.fulltext_catalogs WHERE name = 'MarketplaceCatalog')
            BEGIN 
                DROP FULLTEXT CATALOG MarketplaceCatalog;
            END");
        }
    }
}