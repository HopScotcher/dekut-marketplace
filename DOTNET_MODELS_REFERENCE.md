# .NET Entity Framework Core Models Reference

This document contains the data models from the original Next.js/Prisma implementation to be recreated in .NET 8 with Entity Framework Core and SQL Server.

## Database Context

- **Original:** PostgreSQL with Prisma ORM
- **Target:** SQL Server with Entity Framework Core
- **ID Strategy:** Used `cuid()` - can switch to GUID or sequential int in .NET

---

## Core Models

### User Entity

Primary user model supporting both OAuth and credentials authentication.

**Properties:**

- `Id` (string/GUID) - Primary Key, originally cuid()
- `Name` (string, nullable) - User's display name
- `Email` (string, unique, nullable) - User email address
- `EmailVerified` (DateTime?, nullable) - Email verification timestamp
- `Image` (string, nullable) - Profile image URL
- `Password` (string, nullable) - Hashed password for credentials (use bcrypt/Identity hashing)
- `Phone` (string, nullable) - Contact phone number
- `Location` (string, nullable) - User location
- `Verified` (bool, default: false) - Account verification status
- `CreatedAt` (DateTime, default: now) - Account creation timestamp
- `UpdatedAt` (DateTime, auto-update) - Last update timestamp
- `ResetToken` (string, nullable) - Password reset token (hashed)
- `ResetTokenExpiry` (DateTime?, nullable) - Reset token expiration
- `Avatar` (string, nullable) - Avatar URL (may duplicate Image field)

**Relationships:**

- One-to-Many with `Account` (OAuth accounts)
- One-to-Many with `Session` (NextAuth sessions)
- One-to-Many with `Product` (user's listed products)

**Indexes:**

- Unique index on Email
- Index on ResetToken for password reset lookups

---

### Product Entity

Core marketplace product listings.

**Properties:**

- `Id` (string/GUID) - Primary Key
- `Name` (string, required) - Product name
- `Description` (string, required) - Product description
- `Price` (decimal, required) - Product price
- `Images` (JSON/string[], required) - Array of image URLs
- `Category` (string, required) - Product category
- `Condition` (string/enum, required) - Product condition: "new", "used", "refurbished"
- `Status` (string/enum, required) - Listing status: "draft", "published"
- `UserId` (string/GUID, required, FK) - Owner's user ID
- `CreatedAt` (DateTime, default: now)
- `UpdatedAt` (DateTime, auto-update)

**Relationships:**

- Many-to-One with `User` (owner, cascade delete)

**Indexes:**

- Index on UserId
- Index on Category
- Index on Status
- Composite index on (Status, CreatedAt)
- Full-text index on Name, Description for search

---

### Account Entity (NextAuth OAuth)

Stores OAuth provider account data for NextAuth integration.

**Properties:**

- `Id` (string/GUID) - Primary Key
- `UserId` (string/GUID, required, FK) - Associated user
- `Type` (string, required) - Account type (usually "oauth")
- `Provider` (string, required) - OAuth provider name (e.g., "google")
- `ProviderAccountId` (string, required) - Provider's user ID
- `RefreshToken` (string, nullable) - OAuth refresh token
- `AccessToken` (string, nullable) - OAuth access token
- `ExpiresAt` (int?, nullable) - Token expiration Unix timestamp
- `TokenType` (string, nullable) - Token type (e.g., "Bearer")
- `Scope` (string, nullable) - OAuth scopes granted
- `IdToken` (string, nullable) - OpenID Connect ID token
- `SessionState` (string, nullable) - OAuth session state

**Relationships:**

- Many-to-One with `User` (cascade delete)

**Indexes:**

- Unique composite index on (Provider, ProviderAccountId)
- Index on UserId

---

### Session Entity (NextAuth Sessions)

Stores NextAuth session tokens (required for custom adapter).

**Properties:**

- `Id` (string/GUID) - Primary Key
- `SessionToken` (string, unique, required) - Session identifier
- `UserId` (string/GUID, required, FK) - Associated user
- `Expires` (DateTime, required) - Session expiration time

**Relationships:**

- Many-to-One with `User` (cascade delete)

**Indexes:**

- Unique index on SessionToken
- Index on UserId
- Index on Expires for cleanup queries

---

### VerificationToken Entity (NextAuth)

Email verification and magic link tokens.

**Properties:**

- `Identifier` (string, required) - Email or user identifier
- `Token` (string, unique, required) - Verification token (hashed)
- `Expires` (DateTime, required) - Token expiration

**Indexes:**

- Unique index on Token
- Unique composite index on (Identifier, Token)

---

## API Endpoints to Implement

### NextAuth Custom Adapter Endpoints

- `POST /api/auth/users` - Create user
- `GET /api/auth/users/{id}` - Get user by ID
- `GET /api/auth/users/by-email/{email}` - Get user by email
- `GET /api/auth/users/by-account` - Get user by OAuth account
- `PUT /api/auth/users/{id}` - Update user
- `DELETE /api/auth/users/{id}` - Delete user
- `POST /api/auth/accounts` - Link OAuth account
- `DELETE /api/auth/accounts` - Unlink OAuth account
- `POST /api/auth/sessions` - Create session
- `GET /api/auth/sessions/{sessionToken}` - Get session
- `PUT /api/auth/sessions/{sessionToken}` - Update session
- `DELETE /api/auth/sessions/{sessionToken}` - Delete session
- `POST /api/auth/verification-tokens` - Create verification token
- `DELETE /api/auth/verification-tokens` - Use verification token

### Authentication

- `POST /api/auth/register` - User registration with validation
- `POST /api/auth/login` - Credentials login (returns JWT)
- `POST /api/auth/forgot-password` - Send reset email
- `POST /api/auth/reset-password` - Reset with token

### Products

- `GET /api/products` - List published products (paginated)
- `GET /api/products/search` - Search with filters, SQL full-text search
- `GET /api/products/{id}` - Get single product
- `POST /api/products` - Create product (multipart/form-data for images)
- `PUT /api/products/{id}` - Update product (owner only)
- `DELETE /api/products/{id}` - Delete product (owner only)
- `PATCH /api/products/{id}/status` - Toggle draft/published
- `DELETE /api/products/bulk` - Bulk delete (owner only)
- `GET /api/users/{userId}/products` - Get user's products

### File Upload

- `POST /api/upload/images` - Upload product images to blob storage
- Returns array of URLs

---

## Notes for .NET Implementation

### JWT Configuration

- Share JWT secret between Next.js and .NET
- Or use asymmetric keys (RS256)
- Include user ID, email in JWT claims

### CORS Configuration

```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("NextJsClient", policy => {
        policy.WithOrigins("http://localhost:3000", "https://yourdomain.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

### SQL Server Full-Text Search

- Create full-text catalog for Product table
- Index Name and Description columns
- Use CONTAINS or FREETEXT in queries

### Image Storage

- Use Azure Blob Storage or AWS S3
- Return URLs instead of base64
- Support multipart/form-data uploads

---

**Created:** December 27, 2025  
**Source:** Next.js Dekut Marketplace Prisma Schema  
**Target:** .NET 8 + Entity Framework Core + SQL Server
