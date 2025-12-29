using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DeKutMarketplace.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DeKutMarketplace.Api.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options ): base(options)
        {
        }

        public DbSet<Product> Products {get; set;}
        public DbSet<Category> Categories {get; set;}

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Product>()
            .HasIndex(p => p.CategoryId);

            builder.Entity<Product>()
            .HasIndex(p => p.UserId);

            builder.Entity<Product>()
            .HasIndex(p => p.Status);

            builder.Entity<Product>()
            .HasIndex(p => p.CreatedAt);

            builder.Entity<Category>()
            .HasIndex(c => c.Slug)
            .IsUnique();

            builder.Entity<Product>()
            .HasIndex(p => p.Price);



            // rshps

            builder.Entity<Product>()
            .HasOne(p => p.User)
            .WithMany(u => u.Products)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
        }
         
    }
}