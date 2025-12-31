using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Data;
using DeKutMarketplace.Api.Dtos;
using DeKutMarketplace.Api.Interfaces;
using DeKutMarketplace.Api.Mappers.CategoryMappers;
using DeKutMarketplace.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DeKutMarketplace.Api.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _dbContext;
        public CategoryService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto)
        {

            var newCategory = new Category
            {
                Name = createCategoryDto.Name,
                Description = createCategoryDto.Description,
                Icon = createCategoryDto.Icon,
                Slug = GenerateSlug(createCategoryDto.Name),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _dbContext.Categories.AddAsync(newCategory);

            await _dbContext.SaveChangesAsync();

            return newCategory.ToCategoryOutputDto();
        }

        public async Task<CategoryDto?> DeleteCategoryAsync(string id)
        {
            var category = await _dbContext.Categories.Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == id);

            if(category == null)
            {
                return null;
            }

            if(category.Products != null && category.Products.Count > 0)
            {
                throw new InvalidOperationException("Cannot delete category with existing products");
            }

            _dbContext.Categories.Remove(category);
            await _dbContext.SaveChangesAsync();

            return category.ToCategoryOutputDto();
        }

        public async Task<List<CategoryDto>> GetAllCategoriesAsync()
        {
            var categories = await _dbContext.Categories.Select(c => c.ToCategoryOutputDto()).ToListAsync();

            return categories;
             
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(string id)
        {
             var category = await _dbContext.Categories.Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == id);

             if(category  == null)
            {
                return null;
            }

            return category.ToCategoryOutputDto();
        }

        public async Task<CategoryDto?> UpdateCategoryAsync(UpdateCategoryDto updateCategoryDto, string id)
        {
            var category = await _dbContext.Categories.FirstOrDefaultAsync(c => c.Id == id);

            if(category == null)
            {
                throw new ArgumentNullException("Category not found");
            }

             if(updateCategoryDto.Name != null)
            {
                category.Name = updateCategoryDto.Name;
            }

             if(updateCategoryDto.Description != null)
            {
                category.Description = updateCategoryDto.Description;
            }

             if(updateCategoryDto.Icon != null)
            {
                category.Icon = updateCategoryDto.Icon;
            }
            
            await _dbContext.SaveChangesAsync();

            return category.ToCategoryOutputDto();
 
        }


        // In CategoryService.cs
private static string GenerateSlug(string name)
{
    return name
        .ToLowerInvariant()
        .Replace(" ", "-")
        .Replace("&", "and")
        .Replace("'", "");
}
    }
}