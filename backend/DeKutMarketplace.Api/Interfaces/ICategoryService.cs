using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Dtos;
using DeKutMarketplace.Api.Models;

namespace DeKutMarketplace.Api.Interfaces
{
    public interface ICategoryService
    {
        Task<List<CategoryDto>>  GetAllCategoriesAsync();
        Task<CategoryDto?> GetCategoryByIdAsync(string id);
        Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto);
        Task<CategoryDto?> UpdateCategoryAsync(UpdateCategoryDto updateCategoryDto, string id);
        Task<CategoryDto?> DeleteCategoryAsync(string id);
    }
}