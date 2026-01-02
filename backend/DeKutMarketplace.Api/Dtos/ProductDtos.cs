using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Models;
using DeKutMarketplace.Api.Models.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using Org.BouncyCastle.Asn1.Cmp;
using Org.BouncyCastle.Bcpg.OpenPgp;

namespace DeKutMarketplace.Api.Dtos
{
    public class ProductDto
    {
        public string Id {get; set;} = string.Empty;
        public string Name {get; set;} = string.Empty;
        public string Description {get; set;} = string.Empty;
        public decimal Price {get; set;}
        public ProductCondition Condition {get; set;} 
        public ProductStatus Status {get; set;}
        public string Images {get; set;} = "[]";
        public string Tags {get; set; } = "[]";
        public string Location {get; set;} = string.Empty;
        public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
        public bool Negotiable {get; set;}

        // navigational properties
        public string CategoryId {get; set;} = string.Empty;
        public string CategoryName {get; set;} = string.Empty;
        public string SellerId {get; set;} = string.Empty;
        public string SellerName {get; set;} = string.Empty;
    }


    public class CreateProductDto
    {
        [Required, MaxLength(200, ErrorMessage = "Product name cannot exceed 200 characters")]
        public string Name {get; set;} = string.Empty;

        [Required, MaxLength(2000, ErrorMessage = "Product description cannot exceed 2000 characters")]
        public string Description {get; set;} = string.Empty;

        [Required, Range(0, double.MaxValue)]
        public decimal Price { get; set;}

        [Required, MaxLength(100)]
        public string Location {get; set;} = string.Empty;

        [Required]
        public string CategoryId {get; set;} = string.Empty;

        public bool Negotiable { get; set; } = true;
        public string Images {get; set;} = "[]";
        public string Tags {get; set;} = "[]";
        public ProductStatus Status {get; set;}
        public ProductCondition Condition {get; set;} = ProductCondition.Refurbished;

        

    }

    public class UpdateProductDto
    {
        [MaxLength(200)]
        public string? Name {get; set;}
        [MaxLength(2000)]
        public string? Description {get;set;}

        [Range(0, double.MaxValue)]
        public decimal? Price { get; set; }
        [MaxLength(100)]


        public string? Location { get; set;}
        public string? Tags { get; set; } 
        public bool? Negotiable { get; set; }
        public string? CategoryId { get; set;}
        public ProductStatus? Status {get; set;}
        public ProductCondition? Condition { get; set;}
        public string? Images {get; set;}  
    }
}