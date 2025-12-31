using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace DeKutMarketplace.Api.Dtos
{
    public class CategoryDto
    {
        public string Id {get; set;} = string.Empty;
        public string Name {get; set;} = string.Empty;
        public string Description {get; set;} = string.Empty;
        public string Icon {get; set;} = string.Empty;
        public int ProductCount {get; set;}
    }

    public class CreateCategoryDto{
        [Required(ErrorMessage = "Category name is required")]
        [MinLength(1, ErrorMessage = "Category  name cannot be empty")]
        [MaxLength(50, ErrorMessage = "Category name cannot exceed 50 characters")]
        public string Name {get; set;} = string.Empty;
         
        // [MinLength(10, ErrorMessage = "Category  name cannot be less than 10 character")]
        [MaxLength(300, ErrorMessage = "Category name cannot be longer than 300 characters")]
        public string? Description {get; set;}
        public string? Icon {get; set;}
    }

    public class UpdateCategoryDto
    {
        [MaxLength(50, ErrorMessage = "Name cannot exceed 50 characters")]
        public string? Name {get; set;}

        [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description {get; set;}
        public string? Icon {get; set;}
    }
}