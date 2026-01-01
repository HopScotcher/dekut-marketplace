using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Dtos;
using DeKutMarketplace.Api.Models;

namespace DeKutMarketplace.Api.Mappers.CategoryMappers
{
    public static  class CategoryMappers 
    {
         public static CategoryDto ToCategoryOutputDto(this Category categoryModel)
        {
            return new CategoryDto
            {
                Id = categoryModel.Id,
                Name = categoryModel.Name,
                Description = categoryModel.Description?? string.Empty,
                Icon = categoryModel.Icon?? string.Empty,
                ParentCategoryId = categoryModel.ParentCategoryId,
                ParentCategoryName = categoryModel.ParentCategory?.Name,
                ProductCount = categoryModel.Products?.Count?? 0,
                SubCategoryCount = categoryModel.SubCategories?.Count ?? 0
            };

        }
    }
}