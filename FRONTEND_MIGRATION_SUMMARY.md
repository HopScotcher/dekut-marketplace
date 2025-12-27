# Frontend Migration to .NET Backend - Implementation Summary

This branch (`feature/dotnet-backend-integration`) contains the Next.js frontend refactored to work with a separate .NET 8 backend API.

## Changes Made

### 1. **Removed Backend Logic**
- ✅ Deleted Prisma schema and ORM files (`prisma/` folder, `lib/prisma.ts`)
- ✅ Deleted Next.js API routes:
  - `/api/products/*` - Product CRUD operations
  - `/api/users/*` - User management
  - `/api/auth/register` - User registration
  - `/api/auth/forgot-password` - Password reset
  - **Kept:** `/api/auth/[...nextauth]` for OAuth handling
- ✅ Removed backend utilities:
  - `lib/email.ts` (nodemailer)
  - Bcrypt password hashing (moved to .NET)
- ✅ Removed dependencies: `@prisma/client`, `prisma`, `@auth/prisma-adapter`, `bcrypt`, `nodemailer`, `fuse.js`, `pg`, `@supabase/supabase-js`

### 2. **Created .NET API Integration**
- ✅ **API Client** (`src/lib/apiClient.ts`):
  - Axios instance with auth interceptors
  - Automatic JWT token attachment from NextAuth session
  - Global error handling
  - Multipart file upload support
  - Base URL: `process.env.NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:5000`)

- ✅ **Custom NextAuth Adapter** (`src/lib/dotnet-adapter.ts`):
  - Implements NextAuth Adapter interface
  - Calls .NET endpoints for user, account, session, and verification token operations
  - Required for OAuth (Google) authentication
  - Enables database session storage via .NET backend

- ✅ **Service Layer Updates**:
  - `src/services/productService.ts` - Calls .NET product endpoints
  - `src/services/authService.ts` - Registration, forgot password, reset password

### 3. **Updated Authentication**
- ✅ **auth.ts**: Uses custom .NET adapter instead of PrismaAdapter
- ✅ **Credentials Provider**: Calls `.NET /api/auth/login` endpoint
- ✅ **JWT Callback**: Stores access token from .NET for authenticated requests
- ✅ **RegisterForm**: Updated to call .NET registration API
- ✅ **ForgotPasswordDialog**: Updated to call .NET forgot password API

### 4. **Search Implementation**
- ✅ Removed Fuse.js client-side fuzzy search
- ✅ **useSearch Hook**: Now calls .NET `/api/products/search` endpoint
- ✅ Supports server-side SQL full-text search with filters, sorting, pagination
- ✅ **searchUtils.ts**: Kept minimal client-side filtering/sorting for cached results

### 5. **Product Creation**
- ✅ **ProductCreateForm**: Updated for multipart image upload
  - Step 1: Upload images to .NET `/api/upload/images` endpoint
  - Step 2: Create product with image URLs returned from upload
  - Removed base64 image storage
  - Uses NextAuth session for user authentication

### 6. **TypeScript Types**
- ✅ Updated `src/lib/types.ts` to match .NET DTOs:
  - `User` - Matches .NET User entity
  - `Product` - Matches .NET Product entity with image URLs
  - `Account`, `Session`, `VerificationToken` - For NextAuth adapter
  - `ProductCreateRequest`, `ProductUpdateRequest` - Request DTOs
  - `ApiResponse`, `PaginatedResponse`, `ApiError` - API wrapper types

### 7. **Environment Variables**
- ✅ Added to `.env`:
  ```env
  NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
  ```
- ✅ Removed database connection strings (DATABASE_URL, DIRECT_URL)

### 8. **Package.json**
- ✅ Removed Prisma scripts (`db:generate`, `db:push`, `db:seed`)
- ✅ Removed backend dependencies (see above)
- ✅ Kept: `next-auth`, `axios`, `react-query`, `zod`, `zustand`

---

## .NET Backend Requirements

### Required API Endpoints

#### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Credentials login (return JWT)
- `POST /api/auth/forgot-password` - Send reset email
- `POST /api/auth/reset-password` - Reset with token

#### **NextAuth Custom Adapter**
- `POST /api/auth/users` - Create user
- `GET /api/auth/users/{id}` - Get user by ID
- `GET /api/auth/users/by-email/{email}` - Get user by email
- `GET /api/auth/users/by-account?provider={}&providerAccountId={}` - Get user by OAuth account
- `PUT /api/auth/users/{id}` - Update user
- `DELETE /api/auth/users/{id}` - Delete user
- `POST /api/auth/accounts` - Link OAuth account
- `DELETE /api/auth/accounts?provider={}&providerAccountId={}` - Unlink account
- `POST /api/auth/sessions` - Create session
- `GET /api/auth/sessions/{sessionToken}` - Get session and user
- `PUT /api/auth/sessions/{sessionToken}` - Update session
- `DELETE /api/auth/sessions/{sessionToken}` - Delete session
- `POST /api/auth/verification-tokens` - Create verification token
- `DELETE /api/auth/verification-tokens?identifier={}&token={}` - Use verification token

#### **Products**
- `GET /api/products` - List published products (paginated)
- `GET /api/products/search?q={}&category={}&...` - Search with filters (SQL full-text)
- `GET /api/products/featured?limit={}` - Featured products
- `GET /api/products/{id}` - Get single product
- `GET /api/products/{id}/related?limit={}` - Related products
- `POST /api/products` - Create product (requires auth)
- `PUT /api/products/{id}` - Update product (owner only)
- `DELETE /api/products/{id}` - Delete product (owner only)
- `PATCH /api/products/{id}/status` - Toggle draft/published
- `DELETE /api/products/bulk` - Bulk delete products

#### **Users**
- `GET /api/users/{userId}/products?status={}` - Get user's products

#### **File Upload**
- `POST /api/upload/images` - Upload product images (multipart/form-data)
  - Accept multiple files
  - Store in Azure Blob Storage or local storage
  - Return array of URLs: `{ urls: ["url1", "url2", ...] }`

### Database Models

See `DOTNET_MODELS_REFERENCE.md` for complete entity definitions including:
- User (with password hashing, OAuth support)
- Product (with image URLs, full-text index)
- Account (NextAuth OAuth)
- Session (NextAuth sessions)
- VerificationToken (NextAuth)
- Category, Order, OrderItem, Review (future implementation)

### Configuration

#### CORS
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

#### JWT Authentication
- Share JWT secret with Next.js NextAuth configuration
- Or use asymmetric keys (recommended for production)
- Validate Bearer tokens in `Authorization` header
- Extract user ID from JWT claims

#### SQL Server Full-Text Search
- Create full-text catalog on `Product` table
- Index `Name` and `Description` columns
- Use `CONTAINS` or `FREETEXT` in search queries

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Update Environment Variables
Create `.env.local` with:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Start .NET Backend
Ensure your .NET 8 API is running on port 5000 (or update `NEXT_PUBLIC_API_BASE_URL`)

### 4. Run Next.js Frontend
```bash
npm run dev
```

### 5. Test Integration
- Register new user → Should call .NET registration endpoint
- Sign in with Google → Should use NextAuth adapter to store in .NET DB
- Sign in with credentials → Should call .NET login endpoint
- Create product → Should upload images and create product via .NET API
- Search products → Should call .NET search endpoint

---

## Important Notes

### Authentication Flow
1. **OAuth (Google)**: NextAuth handles OAuth flow → Custom adapter stores data in .NET DB
2. **Credentials**: NextAuth sends credentials to .NET `/api/auth/login` → Returns JWT
3. **Protected Routes**: Middleware checks NextAuth session → API requests include JWT in header

### Image Storage
- **Old**: Base64 encoded in database (inefficient)
- **New**: Images uploaded to .NET → Stored in blob storage → URLs returned and saved in Product entity

### Search
- **Old**: Client-side Fuse.js fuzzy search (loads all products)
- **New**: Server-side SQL full-text search with pagination (scalable)

### Session Strategy
- **Current**: JWT-only (stateless)
- **With Adapter**: Database sessions stored in .NET DB (more secure, supports revocation)

---

## Migration Status

✅ **Completed:**
- Prisma removal
- API route deletion
- .NET API client creation
- Custom NextAuth adapter
- Service layer updates
- Product creation with multipart upload
- Search implementation
- Type definitions
- Dependency cleanup

⏳ **Pending .NET Implementation:**
- All API endpoints listed above
- Database models with EF Core
- JWT authentication middleware
- CORS configuration
- File upload to blob storage
- SQL full-text search

📝 **Future Enhancements:**
- Category management (currently mock data)
- Order/checkout flow
- Review and rating system
- User profile management
- Email notifications (verification, password reset)
- Admin dashboard

---

## Rollback

To revert to the original full-stack Next.js implementation:
```bash
git checkout main
```

The `main` branch contains the original Prisma + Next.js API routes setup.

---

**Branch:** `feature/dotnet-backend-integration`  
**Created:** December 27, 2025  
**Status:** ✅ Frontend refactoring complete, ready for .NET backend integration
