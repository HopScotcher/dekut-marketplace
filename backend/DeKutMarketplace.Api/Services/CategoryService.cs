using System;
using System.Collections.Generic;
using System.Diagnostics;
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
            // Trim whitespace from all incoming string properties
            createCategoryDto.Name = createCategoryDto.Name.Trim();
            if (createCategoryDto.Description != null)
            {
                createCategoryDto.Description = createCategoryDto.Description.Trim();
            }
            if (createCategoryDto.Icon != null)
            {
                createCategoryDto.Icon = createCategoryDto.Icon.Trim();
            }
            if (createCategoryDto.ParentCategoryId != null)
            {
                createCategoryDto.ParentCategoryId = createCategoryDto.ParentCategoryId.Trim();
            }

            var newCategory = new Category{

            };

            if(!string.IsNullOrEmpty(createCategoryDto.ParentCategoryId)){
                var parentCategory = await _dbContext.Categories.FirstOrDefaultAsync(c => c.Id == createCategoryDto.ParentCategoryId);

                if(parentCategory == null){
                    throw new ArgumentException("Parent category not found");
                }

                if(parentCategory.ParentCategoryId != null){
                    throw new ArgumentException("Cannot create a subcategory to a subcategory. Max depth is 2 levels");
                }

                newCategory.ParentCategoryId = createCategoryDto.ParentCategoryId;
            }


             newCategory.Name = createCategoryDto.Name;
                newCategory.Description = createCategoryDto.Description;
                newCategory.Icon = createCategoryDto.Icon;
                newCategory.Slug = createCategoryDto.Name.ToLower().Replace(" ", "-").Replace("&", "and").Replace("'", "");
                newCategory.IsActive = true;
                newCategory.CreatedAt = DateTime.UtcNow;
                newCategory.ParentCategoryId = null;


            await _dbContext.Categories.AddAsync(newCategory);
            await _dbContext.SaveChangesAsync();

            var createdCategory = await _dbContext.Categories
            .Include(c => c.Products)
            .Include(c => c.ParentCategory)
            .Include(c => c.SubCategories)
            .FirstAsync(c => c.Id == newCategory.Id);

            return createdCategory.ToCategoryOutputDto();
        }

        public async Task<CategoryDto?> DeleteCategoryAsync(string id)
        {
            var category = await _dbContext.Categories.Include(c => c.SubCategories).Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == id);

             if(category == null)
            {
                return null;
            }

            if(category.SubCategories != null && category.SubCategories.Count > 0)
            {
                throw new InvalidOperationException("Cannot delete a parent category with subcategories");
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
            var categories = await _dbContext.Categories
            .Include(c => c.ParentCategory)
            .Include(c => c.SubCategories)
            .Include(c => c.Products)
            .ToListAsync();

            return categories.Select(c => c.ToCategoryOutputDto()).ToList();
             
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(string id)
        {
             var category = await _dbContext.Categories.Include(c => c.ParentCategory).Include(c => c.SubCategories).Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == id);

             if(category  == null)
            {
                return null;
            }

            return category.ToCategoryOutputDto();
        }

        public async Task<CategoryDto?> UpdateCategoryAsync(UpdateCategoryDto updateCategoryDto, string id)
        {
            var category = await _dbContext.Categories.Include(c => c.SubCategories).FirstOrDefaultAsync(c => c.Id == id);

            if(category == null)
            {
                return null;
            }

            if(updateCategoryDto.ParentCategoryId != category.ParentCategoryId)
            {
                if (string.IsNullOrEmpty(updateCategoryDto.ParentCategoryId))
                {
                    category.ParentCategoryId = null;
                }
            }

            else
            {

             if(updateCategoryDto.ParentCategoryId != null)
            {
                if(updateCategoryDto.ParentCategoryId == id)
                {
                    throw new ArgumentException("A category cannot be its own parent");
                }

                if(category.SubCategories != null && category.SubCategories.Count> 0)
                {
                    throw new ArgumentException("This parent category cannot be under another category. It has subcategories");
                }

                 var newParent = await _dbContext.Categories.FirstOrDefaultAsync(c => c.Id == updateCategoryDto.ParentCategoryId);

                 if(newParent == null)
                {
                    throw new ArgumentException("parent category not found");
                }

                if(newParent.ParentCategoryId != null)
                {
                    throw new ArgumentException("Subcategory cannot be used as a parent. Max depth is 2 levels");
                }

                category.ParentCategoryId = updateCategoryDto.ParentCategoryId;
            }
            }

             if(!string.IsNullOrWhiteSpace(updateCategoryDto.Name))
            {     
                var newSlug = updateCategoryDto.Name.ToLower().Replace("'", "").Replace("&", "and").Replace(" ", "-").Replace(",", "-");

                var existingCategory = await _dbContext.Categories.FirstOrDefaultAsync(category => category.Slug == newSlug && category.Id != id);

                if(existingCategory != null)
                {
                    throw new ArgumentException($"A category with the name '{updateCategoryDto.Name}' already exists");
                }

                category.Name = updateCategoryDto.Name;
                category.Slug = newSlug;
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

            var updatedCategory = await _dbContext.Categories
            .Include(c => c.Products)
            .Include(c => c.ParentCategory)
            .Include(c => c.SubCategories)
            .FirstAsync(c => c.Id == id);

            return updatedCategory.ToCategoryOutputDto();
             
        }


    }
}