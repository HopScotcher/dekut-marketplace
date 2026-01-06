using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Dtos;
using DeKutMarketplace.Api.Helpers;
using DeKutMarketplace.Api.Migrations;

namespace DeKutMarketplace.Api.Interfaces
{
    public interface IProductService
    {
         Task<ProductDto?> CreateProductAsync(CreateProductDto createProduct, string userId);
        Task<ProductDto?> UpdateProductAsync(UpdateProductDto updateProduct, string userId, IList<string> userRoles, string id);

        Task<ProductDto?> DeleteProductAsync(string id, string userId, IList<string> userRoles);

        Task<ProductDto?> GetProductByIdAsync(string id);

        Task<List<ProductDto>> GetAllProductsAsync(QueryObject query);
    }
}