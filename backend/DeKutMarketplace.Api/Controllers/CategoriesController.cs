using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Dtos;
using DeKutMarketplace.Api.Interfaces;
using DeKutMarketplace.Api.Mappers.CategoryMappers;
using DeKutMarketplace.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Migrations.Operations;

namespace DeKutMarketplace.Api.Controllers
{
    [Route("api/categories")]
    [Authorize]

    public class CategoriesController :ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly ILogger<CategoriesController> _logger;
        public CategoriesController(ICategoryService categoryService, ILogger<CategoriesController> logger)
        {
            _categoryService = categoryService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllCategories()
        {
            var allCategories = await _categoryService.GetAllCategoriesAsync();
            return Ok(allCategories);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCategoryById([FromRoute] string id)
        {
            var category = await _categoryService.GetCategoryByIdAsync(id);

            if(category == null)
            {
                return NotFound();
            }

            return Ok(category);

        }

         
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto categoryDto)
        {
            try
            {
                var createCategory = await _categoryService.CreateCategoryAsync(categoryDto);

                return CreatedAtAction(nameof(GetCategoryById), new {id = createCategory.Id}, createCategory );
            }catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory([FromBody] UpdateCategoryDto updateCategoryDto, string id)
        {
            var updateCategory = await _categoryService.UpdateCategoryAsync(updateCategoryDto, id);

            if (updateCategory == null)
            {
                return BadRequest(new {message = "Category could not be found"});
            }

            return Ok(updateCategory);
        }


        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]

        public async Task<IActionResult> DeleteCategory(string id)
        {
            try
            {
            var category = await _categoryService.DeleteCategoryAsync(id);

            if(category == null)
                {
                    return NotFound();
                }
            
            return NoContent();
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}