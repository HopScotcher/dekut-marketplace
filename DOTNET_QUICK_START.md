# Quick Start Guide - .NET Backend Development

## What You Need to Build in .NET 8

### 1. Create New .NET 8 Web API Project
```bash
dotnet new webapi -n DekutMarketplace.Api
cd DekutMarketplace.Api
```

### 2. Install Required Packages
```bash
# Entity Framework Core for SQL Server
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.EntityFrameworkCore.Design

# Authentication & JWT
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package BCrypt.Net-Next

# Email sending (optional - for password reset)
dotnet add package MailKit
dotnet add package MimeKit

# Azure Blob Storage (for images)
dotnet add package Azure.Storage.Blobs
```

### 3. Database Models (from DOTNET_MODELS_REFERENCE.md)

Copy the entity definitions from the reference file and create:
- `Models/User.cs`
- `Models/Product.cs`
- `Models/Account.cs`
- `Models/Session.cs`
- `Models/VerificationToken.cs`

### 4. DbContext Setup
```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Session> Sessions { get; set; }
    public DbSet<VerificationToken> VerificationTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure relationships, indexes, constraints
        // See DOTNET_MODELS_REFERENCE.md for details
    }
}
```

### 5. Connection String (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DekutMarketplace;User Id=sa;Password=YourPassword;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "your-super-secret-jwt-key-min-32-chars",
    "Issuer": "DekutMarketplace",
    "Audience": "DekutMarketplace",
    "ExpiryMinutes": 1440
  }
}
```

### 6. Critical Controllers to Create

#### AuthController.cs - **HIGHEST PRIORITY**
```csharp
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request) { }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request) { }
    
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request) { }
    
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request) { }
}
```

#### NextAuthAdapterController.cs - **REQUIRED FOR OAUTH**
All endpoints listed in FRONTEND_MIGRATION_SUMMARY.md under "NextAuth Custom Adapter"

#### ProductsController.cs
```csharp
[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 20) { }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q, ...) { }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(string id) { }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateProduct(ProductCreateRequest request) { }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateProduct(string id, ProductUpdateRequest request) { }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteProduct(string id) { }
}
```

#### UploadController.cs - **REQUIRED FOR IMAGE UPLOAD**
```csharp
[ApiController]
[Route("api/upload")]
public class UploadController : ControllerBase
{
    [HttpPost("images")]
    [Authorize]
    public async Task<IActionResult> UploadImages([FromForm] List<IFormFile> files)
    {
        // Upload to Azure Blob Storage or local storage
        // Return URLs
        return Ok(new { urls = new[] { "url1", "url2" } });
    }
}
```

### 7. JWT Authentication Setup (Program.cs)
```csharp
// Add services
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

builder.Services.AddAuthorization();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("NextJsClient", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Use in middleware
app.UseCors("NextJsClient");
app.UseAuthentication();
app.UseAuthorization();
```

### 8. Database Migration
```bash
# Create initial migration
dotnet ef migrations add InitialCreate

# Apply to database
dotnet ef database update
```

### 9. Run the API
```bash
dotnet run
```
Should start on `https://localhost:5001` and `http://localhost:5000`

---

## Testing with Next.js Frontend

### 1. Update Next.js .env.local
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### 2. Start Next.js
```bash
npm run dev
```

### 3. Test Registration Flow
1. Go to http://localhost:3000/auth/register
2. Fill form and submit
3. Should call `POST http://localhost:5000/api/auth/register`
4. Check .NET console logs for request
5. Verify user created in SQL Server

### 4. Test Login Flow
1. Go to http://localhost:3000/auth/signin
2. Enter credentials
3. Should call `POST http://localhost:5000/api/auth/login`
4. JWT should be returned and stored in NextAuth session

### 5. Test Product Creation
1. Sign in first
2. Go to http://localhost:3000/sell
3. Upload images and fill form
4. Should upload images to `POST http://localhost:5000/api/upload/images`
5. Then create product at `POST http://localhost:5000/api/products`

---

## Common Issues & Solutions

### Issue: CORS Errors
**Solution:** Ensure CORS policy allows `http://localhost:3000` and includes credentials

### Issue: 401 Unauthorized on Protected Endpoints
**Solution:** 
- Check JWT is being sent in Authorization header
- Verify JWT secret matches between .NET and NextAuth
- Check token expiration

### Issue: Image Upload Fails
**Solution:**
- Ensure `[FromForm]` attribute on upload controller
- Check Content-Type is `multipart/form-data`
- Verify file size limits in .NET configuration

### Issue: NextAuth Adapter Errors
**Solution:**
- All adapter endpoints must return correct DTO shapes
- Check date/time format (ISO 8601 strings)
- Ensure 404 returns for not found resources (don't throw exceptions)

---

## Next Steps After Basic Setup

1. **Implement Search**: SQL Server full-text index on Product table
2. **Add Validation**: FluentValidation for request DTOs
3. **Error Handling**: Global exception handler middleware
4. **Logging**: Serilog for structured logging
5. **Testing**: Unit tests for services, integration tests for controllers
6. **Documentation**: Swagger/OpenAPI documentation
7. **Deployment**: Publish to Azure App Service or IIS

---

## Useful SQL Server Queries

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
