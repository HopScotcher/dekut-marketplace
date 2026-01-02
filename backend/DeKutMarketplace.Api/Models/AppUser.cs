using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Attributes;
using Microsoft.AspNetCore.Identity;

namespace DeKutMarketplace.Api.Models
{
    public class AppUser : IdentityUser
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [KenyanPhoneNumber]
        public override string? PhoneNumber { get; set; }

        public string? Image { get; set; }
        public string? Location { get; set; }
        public bool Verified { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // public string Roles {get; set; } = string.Empty;

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}