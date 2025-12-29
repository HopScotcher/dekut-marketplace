# .NET 8 Backend Development Guide - Complete Reference

**DeKUT Marketplace - ASP.NET Core Web API + Entity Framework Core + ASP.NET Identity**

This comprehensive guide covers everything you need to build the .NET backend using Entity Framework Core with ASP.NET Identity for authentication, and how it integrates with the Next.js frontend via NextAuth.

---

## Table of Contents

1. [Understanding ASP.NET Identity & OAuth Integration](#understanding-identity)
2. [Database Models & Entity Framework](#database-models)
3. [Project Setup](#project-setup)
4. [API Endpoints to Implement](#api-endpoints)
5. [Testing & Integration](#testing)
6. [Common Issues & Solutions](#common-issues)

---

## Understanding ASP.NET Identity & OAuth Integration {#understanding-identity}

### What is ASP.NET Identity?

ASP.NET Identity is Microsoft's built-in authentication system that handles:

- **User management** - Creating, updating, deleting users
- **Password hashing** - Automatic secure password storage (PBKDF2)
- **Email/username verification**
- **Role-based authorization**
- **Token generation** - For password reset, email confirmation
- **External OAuth login** - Google, Facebook, GitHub, etc.

### Identity vs Custom User Models

❌ **You DON'T Need to Build:**

- Custom `User` model from scratch
- Custom `Account` model for OAuth
- Password hashing logic
- Email confirmation token logic

✅ **What You DO Build:**

- Extend `IdentityUser` with custom fields
- Custom `Product` model
- NextAuth adapter endpoints (for frontend integration)
- Business logic controllers

### How Identity Works with NextAuth (Frontend)

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Next.js Frontend (NextAuth)                                 │
│         │                                                     │
│         │ 1. User clicks "Sign in with Google"              │
│         ▼                                                     │
│  OAuth Provider (Google)                                     │
│         │                                                     │
│         │ 2. Returns OAuth tokens                            │
│         ▼                                                     │
│  NextAuth Adapter                                            │
│         │                                                     │
│         │ 3. Calls .NET API: POST /api/auth/users           │
│         │    POST /api/auth/accounts                         │
│         ▼                                                     │
│  .NET Backend (ASP.NET Identity)                            │
│         │                                                     │
│         │ 4. Creates/updates user in SQL Server             │
│         │    Stores OAuth tokens                             │
│         ▼                                                     │
│  Returns User + Session to NextAuth                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Key Points:**

- NextAuth handles OAuth flow on the frontend
- .NET API stores user data using Identity
- Identity's `UserManager` and `SignInManager` handle all user operations
- You build REST endpoints that NextAuth's custom adapter calls

---

## Database Models & Entity Framework {#database-models}

### Database Context

- **Target:** SQL Server with Entity Framework Core
- **ID Strategy:** Identity uses `string` IDs by default (GUID recommended)
- **Authentication:** ASP.NET Identity handles User, Roles, Claims, Logins

### Core Models to Create

#### 1. ApplicationUser (Extends IdentityUser)

**Location:** `backend/DeKutMarketplace.Api/Models/ApplicationUser.cs`

```csharp
using Microsoft.AspNetCore.Identity;

namespace DeKutMarketplace.Api.Models;

public class ApplicationUser : IdentityUser
{
    // IdentityUser already provides:
    // - Id (string)
    // - UserName
    // - Email
    // - EmailConfirmed
    // - PasswordHash
    // - PhoneNumber
    // - SecurityStamp
    // - LockoutEnd, AccessFailedCount, etc.

    // Add custom fields:
    public string? Name { get; set; }
    public string? Image { get; set; }
    public string? Location { get; set; }
    public bool Verified { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
```

**What Identity Provides:**

- `Id` - Primary key (string/GUID)
- `Email` - Email address
- `EmailConfirmed` - Email verification status
- `PasswordHash` - Hashed password (you never see plaintext)
- `PhoneNumber` - Phone number
- `SecurityStamp` - For security validation
- `TwoFactorEnabled`, `LockoutEnabled` - Security features

**What You Add:**

- `Name` - Display name
- `Image` - Profile picture URL
- `Location` - User location for marketplace
- `Verified` - Seller verification status
- `CreatedAt`, `UpdatedAt` - Timestamps

---

#### 2. Product Model

**Location:** `backend/DeKutMarketplace.Api/Models/Product.cs`

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DeKutMarketplace.Api.Models;

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
    public string Images { get; set; } = "[]"; // JSON array of URLs

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Condition { get; set; } = "used"; // "new", "used", "refurbished"

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "draft"; // "draft", "published"

    [Required]
    public string UserId { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation property
    [ForeignKey(nameof(UserId))]
    public virtual ApplicationUser User { get; set; } = null!;
}
```

**Indexes Required:**

- Index on `UserId` (for user's products query)
- Index on `Category` (for category filtering)
- Index on `Status` (for published/draft filtering)
- Composite index on `(Status, CreatedAt)` (for listing published products)
- **Full-text index** on `Name, Description` (for search)

---

#### 3. OAuth External Login (Handled by Identity)

Identity provides `IdentityUserLogin<string>` which stores:

- `LoginProvider` - OAuth provider name (e.g., "Google")
- `ProviderKey` - Provider's user ID
- `ProviderDisplayName` - Display name
- `UserId` - Link to ApplicationUser

**You don't create this model** - Identity handles it automatically!

---

#### 4. NextAuth Session & Verification Tokens

For NextAuth integration, you may need custom tables:

**Location:** `backend/DeKutMarketplace.Api/Models/Session.cs`

```csharp
namespace DeKutMarketplace.Api.Models;

public class Session
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string SessionToken { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public DateTime Expires { get; set; }

    public virtual ApplicationUser User { get; set; } = null!;
}
```

**Location:** `backend/DeKutMarketplace.Api/Models/VerificationToken.cs`

```csharp
namespace DeKutMarketplace.Api.Models;

public class VerificationToken
{
    public string Identifier { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public DateTime Expires { get; set; }
}
```

**Note:** These are only needed if you're using NextAuth's custom adapter pattern. If you use NextAuth with JWTs only, you can skip these.

---

### DbContext Setup

**Location:** `backend/DeKutMarketplace.Api/Data/ApplicationDbContext.cs`

```csharp
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using DeKutMarketplace.Api.Models;

namespace DeKutMarketplace.Api.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Your custom tables
    public DbSet<Product> Products { get; set; }
    public DbSet<Session> Sessions { get; set; }
    public DbSet<VerificationToken> VerificationTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // CRITICAL: Call base first!

        // Configure Product
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => new { e.Status, e.CreatedAt });

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Products)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Session
        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SessionToken).IsUnique();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Expires);

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure VerificationToken
        modelBuilder.Entity<VerificationToken>(entity =>
        {
            entity.HasKey(e => new { e.Identifier, e.Token });
            entity.HasIndex(e => e.Token).IsUnique();
        });
    }
}
```

**What `IdentityDbContext` Provides:**

- `Users` - ApplicationUser table
- `Roles` - Role definitions
- `UserRoles` - User-Role mappings
- `UserClaims` - Additional user claims
- `UserLogins` - External OAuth logins
- `UserTokens` - Refresh tokens, etc.
- Plus more for 2FA, lockout, etc.

---

## Project Setup {#project-setup}

### 1. Project Structure

Your monorepo structure:

```
dekut-marketplace/
├── backend/
│   ├── DeKutMarketplace.Api/
│   │   ├── Controllers/
│   │   ├── Data/
│   │   │   └── ApplicationDbContext.cs
│   │   ├── Models/
│   │   │   ├── ApplicationUser.cs
│   │   │   ├── Product.cs
│   │   │   ├── Session.cs
│   │   │   └── VerificationToken.cs
│   │   ├── Dtos/
│   │   ├── Services/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   └── DeKutMarketplace.sln
└── frontend/
    └── (Next.js app)
```

### 2. Install Required Packages

Navigate to the backend project and install:

```bash
cd backend/DeKutMarketplace.Api

# Entity Framework Core for SQL Server
dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 8.*
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.*
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.*

# ASP.NET Identity (handles user auth, OAuth, password hashing)
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore --version 8.*

# JWT Authentication
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer

# Email sending (optional - for password reset)
dotnet add package MailKit
dotnet add package MimeKit

# Azure Blob Storage (for images)
dotnet add package Azure.Storage.Blobs
```

**Why These Packages:**

- `Identity.EntityFrameworkCore` - Provides `IdentityDbContext`, `UserManager`, `SignInManager`
- `JwtBearer` - For validating JWT tokens from NextAuth
- `EntityFrameworkCore.SqlServer` - SQL Server database provider

### 3. Configure Services (Program.cs)

**Location:** `backend/DeKutMarketplace.Api/Program.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DeKutMarketplace.Api.Data;
using DeKutMarketplace.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext with SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// Add ASP.NET Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password settings (customize as needed)
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 8;

    // User settings
    options.User.RequireUniqueEmail = true;

    // Sign-in settings
    options.SignIn.RequireConfirmedEmail = false; // Set true for email verification
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Add JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

builder.Services.AddAuthorization();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("NextJsClient", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://yourdomain.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("NextJsClient");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

**Key Points:**

- `AddIdentity<ApplicationUser, IdentityRole>` - Registers Identity services
- `AddEntityFrameworkStores<ApplicationDbContext>` - Links Identity to EF Core
- `AddDefaultTokenProviders()` - Enables password reset, email confirmation tokens

### 4. Configuration (appsettings.json)

**Location:** `backend/DeKutMarketplace.Api/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DeKutMarketplace;User Id=sa;Password=YourPassword;TrustServerCertificate=True;MultipleActiveResultSets=true"
  },
  "Jwt": {
    "Key": "your-super-secret-jwt-key-minimum-32-characters-long",
    "Issuer": "DeKutMarketplace",
    "Audience": "DeKutMarketplace",
    "ExpiryMinutes": 1440
  },
  "AzureStorage": {
    "ConnectionString": "your-azure-storage-connection-string",
    "ContainerName": "product-images"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

**For Development (appsettings.Development.json):**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DeKutMarketplace;Integrated Security=true;TrustServerCertificate=True;MultipleActiveResultSets=true"
  }
}
```

### 5. Database Migration

```bash
cd backend/DeKutMarketplace.Api

# Create initial migration
dotnet ef migrations add InitialCreate

# Apply to database
dotnet ef database update
```

This will create:

- **Identity Tables:** AspNetUsers, AspNetRoles, AspNetUserLogins, AspNetUserClaims, etc.
- **Custom Tables:** Products, Sessions, VerificationTokens

---

## API Endpoints to Implement {#api-endpoints}

### Authentication Controller

**Location:** `backend/DeKutMarketplace.Api/Controllers/AuthController.cs`

```csharp
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DeKutMarketplace.Api.Models;
using DeKutMarketplace.Api.Dtos;

namespace DeKutMarketplace.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            Name = dto.Name,
            PhoneNumber = dto.Phone,
            Location = dto.Location
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        var token = GenerateJwtToken(user);

        return Ok(new
        {
            user = new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                image = user.Image,
                location = user.Location
            },
            token
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(
            user, dto.Password, lockoutOnFailure: false);

        if (!result.Succeeded)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        var token = GenerateJwtToken(user);

        return Ok(new
        {
            user = new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                image = user.Image
            },
            token
        });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
        {
            // Don't reveal that user doesn't exist
            return Ok(new { message = "Password reset email sent if account exists" });
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);

        // TODO: Send email with token
        // await _emailService.SendPasswordResetEmail(user.Email, token);

        return Ok(new { message = "Password reset email sent" });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
        {
            return BadRequest(new { message = "Invalid token" });
        }

        var result = await _userManager.ResetPasswordAsync(
            user, dto.Token, dto.NewPassword);

        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(new { message = "Password reset successfully" });
    }

    private string GenerateJwtToken(ApplicationUser user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("name", user.Name ?? ""),
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                int.Parse(_configuration["Jwt:ExpiryMinutes"]!)),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

**Required DTOs** (`Dtos/AuthDtos.cs`):

```csharp
namespace DeKutMarketplace.Api.Dtos;

public record RegisterDto(
    string Email,
    string Password,
    string Name,
    string? Phone,
    string? Location);

public record LoginDto(string Email, string Password);

public record ForgotPasswordDto(string Email);

public record ResetPasswordDto(
    string Email,
    string Token,
    string NewPassword);
```

---

### NextAuth Adapter Endpoints (Optional)

If using NextAuth with database sessions, create:

**Location:** `backend/DeKutMarketplace.Api/Controllers/NextAuthController.cs`

```csharp
[ApiController]
[Route("api/auth")]
public class NextAuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _context;

    // Implement these endpoints:

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto) { }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUser(string id) { }

    [HttpGet("users/by-email/{email}")]
    public async Task<IActionResult> GetUserByEmail(string email) { }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto) { }

    [HttpPost("accounts")]
    public async Task<IActionResult> LinkAccount([FromBody] LinkAccountDto dto)
    {
        // Use Identity's AddLoginAsync
        var user = await _userManager.FindByIdAsync(dto.UserId);
        if (user == null) return NotFound();

        var loginInfo = new UserLoginInfo(
            dto.Provider,
            dto.ProviderAccountId,
            dto.Provider);

        await _userManager.AddLoginAsync(user, loginInfo);
        return Ok();
    }

    // Add more adapter endpoints as needed...
}
```

---

### Products Controller

**Location:** `backend/DeKutMarketplace.Api/Controllers/ProductsController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DeKutMarketplace.Api.Data;
using DeKutMarketplace.Api.Models;
using DeKutMarketplace.Api.Dtos;
using System.Security.Claims;

namespace DeKutMarketplace.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProductsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? category = null)
    {
        var query = _context.Products
            .Where(p => p.Status == "published")
            .Include(p => p.User);

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(p => p.Category == category);
        }

        var totalCount = await query.CountAsync();

        var products = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new
        {
            products,
            totalCount,
            currentPage = page,
            pageSize,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] string? q,
        [FromQuery] string? category,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? condition,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Products
            .Where(p => p.Status == "published")
            .Include(p => p.User);

        if (!string.IsNullOrEmpty(q))
        {
            query = query.Where(p =>
                p.Name.Contains(q) || p.Description.Contains(q));
        }

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(p => p.Category == category);
        }

        if (minPrice.HasValue)
        {
            query = query.Where(p => p.Price >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= maxPrice.Value);
        }

        if (!string.IsNullOrEmpty(condition))
        {
            query = query.Where(p => p.Condition == condition);
        }

        var totalCount = await query.CountAsync();

        var products = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new
        {
            products,
            totalCount,
            currentPage = page,
            pageSize,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(string id)
    {
        var product = await _context.Products
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Images = System.Text.Json.JsonSerializer.Serialize(dto.Images),
            Category = dto.Category,
            Condition = dto.Condition,
            Status = dto.Status ?? "draft",
            UserId = userId!
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateProduct(string id, [FromBody] UpdateProductDto dto)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (product.UserId != userId)
        {
            return Forbid();
        }

        product.Name = dto.Name ?? product.Name;
        product.Description = dto.Description ?? product.Description;
        product.Price = dto.Price ?? product.Price;
        if (dto.Images != null)
        {
            product.Images = System.Text.Json.JsonSerializer.Serialize(dto.Images);
        }
        product.Category = dto.Category ?? product.Category;
        product.Condition = dto.Condition ?? product.Condition;
        product.Status = dto.Status ?? product.Status;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(product);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteProduct(string id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (product.UserId != userId)
        {
            return Forbid();
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("users/{userId}")]
    public async Task<IActionResult> GetUserProducts(
        string userId,
        [FromQuery] string? status = null)
    {
        var query = _context.Products
            .Where(p => p.UserId == userId)
            .Include(p => p.User);

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(p => p.Status == status);
        }

        var products = await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(products);
    }
}
```

**Product DTOs** (`Dtos/ProductDtos.cs`):

```csharp
namespace DeKutMarketplace.Api.Dtos;

public record CreateProductDto(
    string Name,
    string Description,
    decimal Price,
    string[] Images,
    string Category,
    string Condition,
    string? Status);

public record UpdateProductDto(
    string? Name,
    string? Description,
    decimal? Price,
    string[]? Images,
    string? Category,
    string? Condition,
    string? Status);
```

---

### Upload Controller

**Location:** `backend/DeKutMarketplace.Api/Controllers/UploadController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeKutMarketplace.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public UploadController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpPost("images")]
    public async Task<IActionResult> UploadImages([FromForm] List<IFormFile> files)
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest(new { message = "No files provided" });
        }

        var urls = new List<string>();
        var uploadsPath = Path.Combine(_env.WebRootPath, "uploads", "products");
        Directory.CreateDirectory(uploadsPath);

        foreach (var file in files)
        {
            if (file.Length > 5 * 1024 * 1024) // 5MB limit
            {
                return BadRequest(new { message = "File size exceeds 5MB limit" });
            }

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            urls.Add($"/uploads/products/{fileName}");
        }

        return Ok(new { urls });
    }
}
```

**Note:** For production, replace local file storage with Azure Blob Storage or AWS S3.

---

## Testing & Integration {#testing}

### 1. Run the Backend

```bash
cd backend/DeKutMarketplace.Api
dotnet run
```

API should start on `https://localhost:5001` and `http://localhost:5000`

### 2. Update Next.js Environment Variables

**Location:** `frontend/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on [http://localhost:3000](http://localhost:3000)

### 4. Test Registration Flow

1. Navigate to http://localhost:3000/auth/register
2. Fill registration form with:
   - Email, Password, Name, Phone, Location
3. Submit → Calls `POST http://localhost:5000/api/auth/register`
4. Check backend console logs for request
5. Verify user created in SQL Server:
   ```sql
   SELECT * FROM AspNetUsers;
   ```

### 5. Test Login Flow

1. Navigate to http://localhost:3000/auth/signin
2. Enter credentials from registration
3. Submit → Calls `POST http://localhost:5000/api/auth/login`
4. JWT token returned and stored in NextAuth session
5. Should redirect to homepage as authenticated user

### 6. Test Product Creation

1. Ensure you're logged in
2. Navigate to http://localhost:3000/sell
3. Upload images:
   - Calls `POST http://localhost:5000/api/upload/images`
   - Returns image URLs
4. Fill product form (Name, Description, Price, Category, Condition)
5. Submit → Calls `POST http://localhost:5000/api/products`
6. Verify product created:
   ```sql
   SELECT * FROM Products WHERE UserId = '<your-user-id>';
   ```

### 7. Test Product Listing

1. Navigate to http://localhost:3000/products
2. Should call `GET http://localhost:5000/api/products`
3. See published products displayed
4. Click on a product → Calls `GET http://localhost:5000/api/products/{id}`

### 8. Test Search

1. Navigate to http://localhost:3000/search
2. Enter search query
3. Calls `GET http://localhost:5000/api/products/search?q=...`
4. Results filtered by query, category, price, etc.

---

## Common Issues & Solutions {#common-issues}

### Issue: CORS Errors

**Symptom:** Browser console shows "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:**

- Verify CORS policy in `Program.cs` includes frontend URL
- Ensure `app.UseCors("NextJsClient");` is called BEFORE `UseAuthentication()`
- For credentials (cookies/auth headers), must use `AllowCredentials()`

### Issue: 401 Unauthorized on Protected Endpoints

**Symptom:** API returns 401 even when user is logged in

**Solution:**

- Check JWT is in Authorization header: `Bearer <token>`
- Verify JWT secret matches in both `.NET appsettings.json` and `NextAuth configuration`
- Check token hasn't expired (default 1440 minutes = 24 hours)
- Ensure `[Authorize]` attribute is on controller/action
- Check `User.FindFirstValue(ClaimTypes.NameIdentifier)` returns valid userId

### Issue: Identity Tables Not Created

**Symptom:** Migration runs but AspNetUsers table doesn't exist

**Solution:**

- Ensure `DbContext` inherits from `IdentityDbContext<ApplicationUser>`
- Call `base.OnModelCreating(modelBuilder);` FIRST in `OnModelCreating`
- Run migration again:
  ```bash
  dotnet ef migrations add InitialCreate --force
  dotnet ef database update
  ```

### Issue: Image Upload Fails

**Symptom:** 400 Bad Request or files are null

**Solution:**

- Use `[FromForm]` attribute on upload method parameter
- Frontend must send `Content-Type: multipart/form-data`
- Check file size limits:
  ```csharp
  // In Program.cs
  builder.Services.Configure<FormOptions>(options =>
  {
      options.MultipartBodyLengthLimit = 10 * 1024 * 1024; // 10MB
  });
  ```
- Ensure `wwwroot` folder exists for local file storage

### Issue: Password Validation Fails

**Symptom:** "Password must have uppercase/digit/special character"

**Solution:**

- Check Identity password options in `Program.cs`:
  ```csharp
  options.Password.RequireDigit = true;
  options.Password.RequireLowercase = true;
  options.Password.RequireUppercase = true;
  options.Password.RequireNonAlphanumeric = false;
  options.Password.RequiredLength = 8;
  ```
- Adjust requirements or ensure frontend validation matches

### Issue: NextAuth OAuth Integration

**Symptom:** OAuth login fails or user not created

**Solution:**

- Implement NextAuth adapter endpoints in `NextAuthController`
- Use `UserManager.AddLoginAsync()` to link OAuth providers
- Check `AspNetUserLogins` table has provider entries:
  ```sql
  SELECT * FROM AspNetUserLogins;
  ```
- Ensure DTOs match NextAuth adapter interface exactly

### Issue: Search Returns No Results

**Symptom:** Products exist but search returns empty array

**Solution:**

- Check `Status` field - only "published" products are returned
- Use `EF.Functions.Like()` for case-insensitive search:
  ```csharp
  query.Where(p => EF.Functions.Like(p.Name, $"%{q}%"));
  ```
- For better search, implement SQL Server Full-Text Search:
  ```sql
  CREATE FULLTEXT CATALOG ProductCatalog AS DEFAULT;
  CREATE FULLTEXT INDEX ON Products(Name, Description)
      KEY INDEX PK_Products;
  ```

### Issue: DateTime Serialization

**Symptom:** Dates appear in wrong format or timezone

**Solution:**

- Always use `DateTime.UtcNow` in backend
- Configure JSON serialization in `Program.cs`:
  ```csharp
  builder.Services.AddControllers()
      .AddJsonOptions(options =>
      {
          options.JsonSerializerOptions.ReferenceHandler =
              System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
      });
  ```

### Issue: EF Core Tracking Issues

**Symptom:** "The instance is already being tracked" error

**Solution:**

- Use `.AsNoTracking()` for read-only queries
- Or detach entity before attaching new one:
  ```csharp
  _context.Entry(existingEntity).State = EntityState.Detached;
  ```

---

## Advanced Features

### 1. SQL Server Full-Text Search

For better product search performance:

```sql
-- Enable full-text search
CREATE FULLTEXT CATALOG ProductCatalog AS DEFAULT;

-- Create full-text index
CREATE FULLTEXT INDEX ON Products(Name, Description)
    KEY INDEX PK_Products
    WITH STOPLIST = SYSTEM;
```

Then in your controller:

```csharp
// Use CONTAINS for full-text search
var products = await _context.Products
    .FromSqlRaw(@"
        SELECT * FROM Products
        WHERE Status = 'published'
        AND CONTAINS((Name, Description), {0})", searchTerm)
    .ToListAsync();
```

### 2. Azure Blob Storage for Images

Replace local file storage:

```csharp
using Azure.Storage.Blobs;

public class BlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;

    public async Task<string> UploadImageAsync(IFormFile file)
    {
        var containerClient = _blobServiceClient
            .GetBlobContainerClient("product-images");

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var blobClient = containerClient.GetBlobClient(fileName);

        using (var stream = file.OpenReadStream())
        {
            await blobClient.UploadAsync(stream, overwrite: true);
        }

        return blobClient.Uri.ToString();
    }
}
```

### 3. Email Service Integration

For password reset and verification:

```csharp
using MailKit.Net.Smtp;
using MimeKit;

public class EmailService
{
    public async Task SendPasswordResetEmailAsync(string email, string token)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("DeKUT Marketplace", "noreply@dekut.com"));
        message.To.Add(new MailboxAddress("", email));
        message.Subject = "Password Reset Request";

        message.Body = new TextPart("html")
        {
            Text = $@"
                <p>Click the link below to reset your password:</p>
                <a href='http://localhost:3000/auth/reset-password?token={token}&email={email}'>
                    Reset Password
                </a>"
        };

        using (var client = new SmtpClient())
        {
            await client.ConnectAsync("smtp.gmail.com", 587, false);
            await client.AuthenticateAsync("your-email@gmail.com", "app-password");
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
```

### 4. Role-Based Authorization

Add roles for admin features:

```csharp
// In Seed data or controller
await _userManager.AddToRoleAsync(user, "Admin");

// In controller
[Authorize(Roles = "Admin")]
[HttpDelete("products/bulk")]
public async Task<IActionResult> BulkDeleteProducts([FromBody] string[] ids)
{
    // Admin-only bulk operations
}
```

### 5. Logging with Serilog

Replace default logging:

```bash
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.File
```

```csharp
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/app-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();
```

---

## Deployment Checklist

### Before Production

- [ ] Change JWT secret to strong random key
- [ ] Use environment variables for secrets (Azure Key Vault)
- [ ] Enable HTTPS only
- [ ] Configure production CORS origins
- [ ] Set up Azure SQL Database
- [ ] Configure Azure Blob Storage for images
- [ ] Enable email service (SendGrid, Azure Communication Services)
- [ ] Add rate limiting middleware
- [ ] Configure logging (Application Insights)
- [ ] Add health check endpoints
- [ ] Enable authentication email confirmation (`RequireConfirmedEmail = true`)
- [ ] Set up CI/CD pipeline (GitHub Actions, Azure DevOps)

### Azure App Service Deployment

```bash
# Publish the app
cd backend/DeKutMarketplace.Api
dotnet publish -c Release -o ./publish

# Deploy to Azure (using Azure CLI)
az webapp up --name dekut-marketplace-api --resource-group DeKutMarketplace
```

---

## Useful SQL Server Queries

### Check Users

```sql
SELECT Id, UserName, Email, EmailConfirmed, PhoneNumber, Location, Verified, CreatedAt
FROM AspNetUsers;
```

### Check OAuth Logins

```sql
SELECT ul.UserId, ul.LoginProvider, ul.ProviderKey, u.Email, u.Name
FROM AspNetUserLogins ul
JOIN AspNetUsers u ON ul.UserId = u.Id;
```

### Check Products by User

```sql
SELECT p.Id, p.Name, p.Price, p.Status, p.CreatedAt, u.Email as SellerEmail
FROM Products p
JOIN AspNetUsers u ON p.UserId = u.Id
WHERE u.Email = 'user@example.com';
```

### Published Products Count

```sql
SELECT COUNT(*) as TotalPublished, AVG(Price) as AvgPrice
FROM Products
WHERE Status = 'published';
```

### Products by Category

```sql
SELECT Category, COUNT(*) as Count, AVG(Price) as AvgPrice
FROM Products
WHERE Status = 'published'
GROUP BY Category
ORDER BY Count DESC;
```

---

## Additional Resources

- [ASP.NET Identity Documentation](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)
- [Entity Framework Core Documentation](https://learn.microsoft.com/en-us/ef/core/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [JWT.io - JWT Debugger](https://jwt.io/)
- [Azure Blob Storage Documentation](https://learn.microsoft.com/en-us/azure/storage/blobs/)

---

**Last Updated:** December 28, 2025  
**Tech Stack:** .NET 8 + Entity Framework Core + ASP.NET Identity + SQL Server  
**Frontend Integration:** Next.js 15 + NextAuth.js + TypeScript

### Check Users Table

```sql
SELECT * FROM Users ORDER BY CreatedAt DESC
```

### Check Products with Users

```sql
SELECT p.*, u.Name as OwnerName
FROM Products p
JOIN Users u ON p.UserId = u.Id
WHERE p.Status = 'published'
ORDER BY p.CreatedAt DESC
```

### Check OAuth Accounts

```sql
SELECT u.Email, a.Provider, a.ProviderAccountId
FROM Accounts a
JOIN Users u ON a.UserId = u.Id
```

---

## Resources

- [ASP.NET Core Web API Tutorial](https://docs.microsoft.com/en-us/aspnet/core/tutorials/first-web-api)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [JWT Authentication in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/security/authentication/)
- [Azure Blob Storage .NET SDK](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-dotnet)
- [SQL Server Full-Text Search](https://docs.microsoft.com/en-us/sql/relational-databases/search/full-text-search)

---

**Ready to start!** Follow this guide step-by-step to build your .NET backend. The Next.js frontend is now fully configured to consume your API.
