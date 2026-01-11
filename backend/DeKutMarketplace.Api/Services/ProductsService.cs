using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Data;
using DeKutMarketplace.Api.Dtos;
using DeKutMarketplace.Api.Helpers;
using DeKutMarketplace.Api.Interfaces;
using DeKutMarketplace.Api.Mappers.ProductMappers;
using DeKutMarketplace.Api.Models;
using DeKutMarketplace.Api.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Crypto.Parameters;

namespace DeKutMarketplace.Api.Services
{
    public class ProductsService : IProductService
    { 
        private readonly AppDbContext _dbContext;
        private readonly IStorageService _storageService;
        private readonly ILogger<ProductsService> _logger;
         
        public ProductsService(AppDbContext dbContext, IStorageService storageService, ILogger<ProductsService> logger)
        {
            _dbContext = dbContext;
            _storageService = storageService;
            _logger = logger;
          
        }
        public async Task<ProductDto?> CreateProductAsync(CreateProductDto createProduct, string userId)
        {

            var categoryExists = await _dbContext.Categories.AnyAsync(c => c.Id == createProduct.CategoryId);
            if (!categoryExists)
            {
                throw new ArgumentException("The specified category does not exist");
            }
             var newProduct = new Product
             {
                 Name = createProduct.Name,
                 Description = createProduct.Description,
                 Price = createProduct.Price,
                 CategoryId = createProduct.CategoryId,
                 Location = createProduct.Location,
                 Negotiable = createProduct.Negotiable,
                 Condition = createProduct.Condition,
                 Status = ProductStatus.Published,
                 Images = createProduct.Images,
                 Tags = createProduct.Tags,
                 CreatedAt = DateTime.UtcNow,
                 UserId = userId
             };

             await _dbContext.Products.AddAsync(newProduct);
             await _dbContext.SaveChangesAsync();


             var createdProduct = await _dbContext.Products.Include(p => p.Category).Include(p => p.User).FirstOrDefaultAsync(p => p.Id == newProduct.Id);

             return createdProduct?.ToProductDto();
        }

        public async Task<ProductDto?> DeleteProductAsync(string id, string userId, IList<string> userRoles)
        {
            var product = await _dbContext.Products.Include(p => p.UserId).Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return null;
            }

            var isOwner = product.UserId == userId;
            var isAdmin = userRoles.Contains("Admin");

            if(!isOwner && !isAdmin)
            {
                throw new UnauthorizedAccessException("Your are not authorized to delete this listing");
            }

             if(!string.IsNullOrEmpty(product.Images) &&  product.Images != "[]")
            {
                try
                {
                    var imageUrls = System.Text.Json.JsonSerializer.Deserialize<List<string>>(product.Images);
                    if(imageUrls != null && imageUrls.Count > 0)
                    {
                        foreach(var imageUrl in imageUrls)
                        {
                            await _storageService.DeleteFileAsync(imageUrl);
                        }
                    }
                }catch(Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete images for product {product}", product);
                }
            }
            
            _dbContext.Products.Remove(product);
            await _dbContext.SaveChangesAsync();

            return product.ToProductDto();
        }

        public async Task<List<ProductDto>> GetAllProductsAsync(QueryObject query)
        {
              var productsQuery =  _dbContext.Products
              .Include(p => p.Category)
              .Include(p => p.User)
              .Where(p => p.Status == ProductStatus.Published)
              .AsQueryable();

            bool isTextSearch = false;

            if (!string.IsNullOrWhiteSpace(query.Name))
            {
                isTextSearch = true;

                var searchTerm = query.Name.Trim().Replace("'", "''");

                productsQuery = productsQuery.Where(p => 
                EF.Functions.Contains(p.Name, searchTerm) || 
                EF.Functions.Contains(p.Description, searchTerm) ||
                EF.Functions.Contains(p.Location, searchTerm) ||
                EF.Functions.Contains(p.Tags, searchTerm));

                productsQuery = productsQuery.OrderByDescending(p => 
                (EF.Functions.Contains(p.Name, searchTerm)? 10: 0) + 
                (EF.Functions.Contains(p.Tags, searchTerm) ? 5 : 0) +
                (EF.Functions.Contains(p.Description, searchTerm)? 2 : 0) +
                (EF.Functions.Contains(p.Location, searchTerm) ? 1 : 0)
                );
            }

              
            if (query.MinPrice.HasValue)
            {
                productsQuery = productsQuery.Where(p => p.Price >= query.MinPrice.Value);
            }

            if (query.MaxPrice.HasValue)
            {
                productsQuery = productsQuery.Where(p => p.Price <= query.MaxPrice.Value);
            }

            if (query.Negotiable)
            {
                productsQuery = productsQuery.Where(p => p.Negotiable == true);
            }

            if (query.Condition.HasValue)
            {
                productsQuery = productsQuery.Where(p => p.Condition == query.Condition.Value);
            }

            if (!string.IsNullOrWhiteSpace(query.Location))
            {
                productsQuery = productsQuery.Where(p => p.Location.ToLower().Contains(query.Location.ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(query.CategoryId))
            {
                productsQuery = productsQuery.Where(p => p.CategoryId == query.CategoryId);
            }

            if (!string.IsNullOrWhiteSpace(query.SellerId))
            {
                productsQuery = productsQuery.Where(p => p.UserId == query.SellerId);
            }


            if (isTextSearch)
            {
                
            if (!string.IsNullOrWhiteSpace(query.SortBy))
            {
 
                productsQuery = query.SortBy.ToLower() switch
                {
                  "price" => query.IsDescending? 
                  ((IOrderedQueryable<Product>)productsQuery).ThenByDescending(p => p.Price) : ((IOrderedQueryable<Product>)productsQuery).ThenBy(p => p.Price),
                  "name" => query.IsDescending ? 
                  ((IOrderedQueryable<Product>)productsQuery).ThenByDescending(p => p.Name) : ((IOrderedQueryable<Product>)productsQuery).ThenBy(p => p.Name),
                  "createdat" => query.IsDescending ? 
                  ((IOrderedQueryable<Product>)productsQuery).ThenByDescending(p => p.CreatedAt) : ((IOrderedQueryable<Product>)productsQuery).ThenBy(p => p.CreatedAt),
                  _ => ((IOrderedQueryable<Product>)productsQuery).ThenByDescending(p => p.CreatedAt)
                };
            }
            else
            {
                    productsQuery = ((IOrderedQueryable<Product>)productsQuery).ThenByDescending(p => p.CreatedAt);
            }
            }
            else
            {
                if (!string.IsNullOrWhiteSpace(query.SortBy))
                {
                    productsQuery = query.SortBy.ToLower() switch
                    {
                         "price" => query.IsDescending 
                ? productsQuery.OrderByDescending(p => p.Price) 
                : productsQuery.OrderBy(p => p.Price),
            "name" => query.IsDescending 
                ? productsQuery.OrderByDescending(p => p.Name) 
                : productsQuery.OrderBy(p => p.Name),
            "createdat" => query.IsDescending 
                ? productsQuery.OrderByDescending(p => p.CreatedAt) 
                : productsQuery.OrderBy(p => p.CreatedAt),
            _ => productsQuery.OrderByDescending(p => p.CreatedAt)
                    };
                }
                else
                {
                    productsQuery = productsQuery.OrderByDescending(p => p.CreatedAt);
                }
            }
               

            var skipNumber = (query.PageNumber - 1) * query.PageSize;
            productsQuery = productsQuery.Skip(skipNumber).Take(query.PageSize);

            var products = await productsQuery.ToListAsync();

            return products.Select(p => p.ToProductDto()).ToList();
        }

        public async Task<ProductDto?> GetProductByIdAsync(string id)
        {
            var product = await _dbContext.Products.Include(p => p.Category).Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id);

            if(product == null)
            {
                return null;
            }

            return product?.ToProductDto();
        }

        public async Task<ProductDto?> UpdateProductAsync(UpdateProductDto updateProduct, string id, IList<string> userRoles, string userId)
        {
             var productToUpdate = await _dbContext.Products.FirstOrDefaultAsync(p => p.Id == id);

             if(productToUpdate == null)
            {
                return null;
            }

            if(productToUpdate.UserId != userId)
            {
                throw new UnauthorizedAccessException("You are not authorized to edit this listing");
            }

            if (!string.IsNullOrEmpty(updateProduct.Name))
            {
                productToUpdate.Name = updateProduct.Name;
            }
            if (!string.IsNullOrEmpty(updateProduct.Description))
            {
                productToUpdate.Description = updateProduct.Description;
            }
            if(updateProduct.Price.HasValue)
            {
                productToUpdate.Price = updateProduct.Price.Value;
            }
            if (!string.IsNullOrEmpty(updateProduct.CategoryId))
            {
                productToUpdate.CategoryId = updateProduct.CategoryId;
            }

            if(updateProduct.Negotiable.HasValue)
            {
                productToUpdate.Negotiable = updateProduct.Negotiable.Value;
            }

            if(updateProduct.Condition.HasValue)
            {
                productToUpdate.Condition = updateProduct.Condition.Value;
            }

            if (!string.IsNullOrEmpty(updateProduct.Images))
            {
                productToUpdate.Images = updateProduct.Images;
            }

            if(!string.IsNullOrEmpty(updateProduct.Tags))
            {
                productToUpdate.Tags = updateProduct.Tags;
            }

            if(updateProduct.Status.HasValue && userRoles.Contains("Admin"))
            {
                productToUpdate.Status = updateProduct.Status.Value;
            }

        await _dbContext.SaveChangesAsync();

        var updatedProduct = await _dbContext.Products.Include(p => p.Category).Include(p => p.User).FirstOrDefaultAsync(p => p.Id == productToUpdate.Id);

        return updatedProduct?.ToProductDto();
        }
    }
}