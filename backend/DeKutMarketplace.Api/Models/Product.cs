using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Models.Enums;
using Microsoft.AspNetCore.Mvc;

namespace DeKutMarketplace.Api.Models
{
    public class Product
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        
        [Required]
        public string Images { get; set; } = "[]";

        [Required]
        public string CategoryId { get; set; }

        [ForeignKey(nameof(CategoryId))]
        public virtual Category? Category {get; set;}

        [Required]
        public bool Negotiable { get; set; } = true;

        [Required]
        public ProductCondition Condition { get; set; } = ProductCondition.Used;

        [Required]
        [MaxLength(100)]
        public string Location {get; set;} = string.Empty;


        [Required]
        public ProductStatus Status { get; set; } = ProductStatus.Draft;

        [Required]
        public string UserId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; } 

        public string Tags {get;set;} = "[]";

        [ForeignKey(nameof(UserId))]
        public virtual AppUser User{ get; set; } = null!; 
    }
}