using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Dtos;
using DeKutMarketplace.Api.Models;

namespace DeKutMarketplace.Api.Mappers.ProductMappers
{
    public static class ProductMappers
    {
        public static ProductDto ToProductDto(this Product product)
        {
            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                Negotiable = product.Negotiable,
                Tags = product.Tags,
                CreatedAt = product.CreatedAt,
                Location = product.Location,
                Images = product.Images,
                Condition = product.Condition,
                CategoryName = product.Category?.Name ?? string.Empty,
                CategoryId = product.CategoryId,
                SellerId = product.UserId,
                SellerName = product.User?.Name ?? string.Empty
            };
        }
    }
}