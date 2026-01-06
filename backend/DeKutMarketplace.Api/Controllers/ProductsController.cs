using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Dtos;
using DeKutMarketplace.Api.Helpers;
using DeKutMarketplace.Api.Interfaces;
using DeKutMarketplace.Api.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Asn1.Esf;

namespace DeKutMarketplace.Api.Controllers
{
    [ApiController]
    [Route("api/products")]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ILogger<ProductsController> _logger;
        public ProductsController(IProductService productService, ILogger<ProductsController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto createProductDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogError("User ID {userId} not found in token", userId);
                return Unauthorized("User ID not found");
            }

            try
            {
            var newProduct = await _productService.CreateProductAsync(createProductDto, userId);
            return CreatedAtAction(nameof(GetProductById), new {id = newProduct.Id}, newProduct);

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
           
        }


        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductById([FromRoute] string id)
        {
            var product = await _productService.GetProductByIdAsync(id);

            if(product == null)
            {
                return NotFound();
            }

            return Ok(product);
        }


        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProduct([FromRoute] string id, [FromBody] UpdateProductDto updateProductDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogError("User ID {userId} not found in token", userId);
                return Unauthorized("User ID not found");
            }

            var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

            try
            {
                var updatedProduct = await _productService.UpdateProductAsync(updateProductDto, userId, userRoles, id);
                if(updatedProduct == null)
                {
                    return NotFound();
                }

                return Ok(updatedProduct);
            }catch(UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteProduct([FromRoute] string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

            
            try
            {

            var deletedProduct = await _productService.DeleteProductAsync(id, userId, userRoles);
            if(deletedProduct == null)
                {
                    return NotFound("Product not found");
                }

            return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
                
            }
        }


        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllProducts([FromQuery] QueryObject query)
        {
            var products = _productService.GetAllProductsAsync(query);

            return Ok(products);
        }

    }
}