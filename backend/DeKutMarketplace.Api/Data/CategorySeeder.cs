using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DeKutMarketplace.Api.Data
{
    public class CategorySeeder
    {
        public static async Task SeedCategories(AppDbContext context)
        {
            // Check if categories already exist
            if (await context.Categories.AnyAsync())
            {
                return; // Database already seeded
            }

            var categories = new List<Category>();

            // Parent Categories
            var electronics = new Category
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Electronics",
                Description = "Electronic devices and accessories",
                Icon = "📱",
                Slug = "electronics"
            };

            var fashion = new Category
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Fashion",
                Description = "Clothes and shoes",
                Icon = "",
                Slug = "fashion"
            };

            var homeAndAppliances = new Category
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Home, Furniture & Appliances",
                Description = "Home appliances and Furniture",
                Icon = "",
                Slug = "home-and-appliances"
            };

            var foodAndBeverages = new Category
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Food & Beverages",
                Description = "Food, drinks and beverages for sale",
                Icon = "",
                Slug = "food-and-beverages"
            };

            categories.AddRange(new[] { electronics, fashion, homeAndAppliances, foodAndBeverages });

            // Electronics Subcategories
            categories.Add(new Category
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Mobile Phones & Tablets",
                Description = "Smartphones, tablets, and accessories",
                Icon = "📱",
                Slug = "mobile-phones-and-tablets",
                ParentCategoryId = electronics.Id
            });

            categories.Add(new Category
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Computers & Laptops",
                Description = "Desktop computers, laptops, and computer accessories",
                Icon = "💻",
                Slug = "computers-and-laptops",
                ParentCategoryId = electronics.Id
            });

            categories.Add(new Category
            {
                Id = Guid.NewGuid().ToString(),
                Name = "TV & Audio",
                Description = "Televisions, sound systems, and entertainment devices",
                Icon = "📺",
                Slug = "tv-and-audio",
                ParentCategoryId = electronics.Id
            });

            // Home and Furniture Subcategories
            categories.Add(new Category
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Furniture",
                Description = "Tables, chairs, beds and other furniture",
                Icon = "",
                Slug = "furniture",
                ParentCategoryId = homeAndAppliances.Id
            });

            categories.Add(new Category
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Kitchenware",
                Description = "Utensils, cutlery, and related cookware",
                Icon = "",
                Slug = "kitchenware",
                ParentCategoryId = homeAndAppliances.Id
            });

            
            categories.Add(new Category
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Home appliances",
                Description = "Water heaters, washing machines, irons and related appliances",
                Icon = "",
                Slug = "home-appliances",
                ParentCategoryId = homeAndAppliances.Id
            });

            // food and beverages

            categories.Add(new Category
            {
                Id = Guid.NewGuid().ToString(),
               Name = "Household products",
                Description = "Sugar, flour, cooking oil and related products",
                Icon = "",
                Slug = "household-products",
                ParentCategoryId = foodAndBeverages.Id
            });

            
            categories.Add(new Category
            {
                Id = Guid.NewGuid().ToString(),
               Name = "Drinks",
                Description = "Soft drinks, juices and related beverages",
                Icon = "",
                Slug = "drinks",
                ParentCategoryId = foodAndBeverages.Id
            });

            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }
    }
}