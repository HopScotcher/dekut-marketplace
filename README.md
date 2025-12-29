# DeKUT Marketplace

A full-stack marketplace application for DeKUT students to buy and sell items.

## Project Structure (Monorepo)

```
dekut-marketplace/
├── frontend/          # Next.js 15 + TypeScript + Tailwind CSS
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
├── backend/           # ASP.NET Core Web API (.NET 8)
│   ├── DeKutMarketplace.Api/
│   └── DeKutMarketplace.sln
└── README.md
```

## Tech Stack

### Frontend

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** NextAuth.js
- **State:** Zustand + React Query

### Backend

- **Framework:** ASP.NET Core Web API
- **Runtime:** .NET 8
- **Database:** SQL Server (planned)
- **ORM:** Entity Framework Core (planned)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- .NET 8 SDK
- SQL Server (for production)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on [http://localhost:3000](http://localhost:3000)

### Backend Setup

```bash
cd backend
dotnet restore
dotnet run --project DeKutMarketplace.Api
```

The API will run on [http://localhost:5000](http://localhost:5000)

## Development

- Frontend calls backend API at `/api/*` endpoints
- CORS is configured for local development
- API client located in `frontend/src/lib/apiClient.ts`

## Documentation

- [`DOTNET_MODELS_REFERENCE.md`](frontend/DOTNET_MODELS_REFERENCE.md) - Backend model reference
- [`DOTNET_QUICK_START.md`](frontend/DOTNET_QUICK_START.md) - .NET quick start guide

## License

MIT
