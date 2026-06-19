<div align="center">

# 🔍 VedEngine

### AI-Powered Search Engine

*Delivering the most optimized search results through intelligent query processing*

[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)

---

</div>

## 📖 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database](#-database)
- [API Reference](#-api-reference)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**VedEngine** is an AI-powered search engine designed to deliver highly optimized search results. Built as a modern monorepo, it separates concerns across multiple workspaces — a **backend API**, a **frontend client**, and an **AI service** — enabling each component to scale and evolve independently.

### Key Features

- 🔎 **Smart Document Search** — Search documents by keyword with optimized query handling
- 📄 **Document Management** — Full CRUD operations for document storage and retrieval
- 📊 **Search Analytics** — Track recent and trending searches for insights
- 🏗️ **Monorepo Architecture** — Clean separation via pnpm workspaces
- ⚡ **High Performance** — Built on Fastify, one of the fastest Node.js frameworks
- 🛡️ **Type Safety** — Prisma ORM with generated types for reliable database access

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      VedEngine                          │
│                    (pnpm monorepo)                       │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Frontend   │  │   Backend    │  │  AI Service   │  │
│  │   (apps/)    │  │   (apps/)    │  │ (services/)   │  │
│  │              │──│              │──│               │  │
│  │  Client App  │  │  Fastify API │  │  ML Pipeline  │  │
│  └──────────────┘  └──────┬───────┘  └───────────────┘  │
│                           │                             │
│                    ┌──────┴───────┐                      │
│                    │  PostgreSQL  │                      │
│                    │  (Supabase)  │                      │
│                    └──────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

### Backend Layered Architecture

The backend follows a clean **3-layer architecture** for separation of concerns:

```
Request ──▶ Route ──▶ Controller ──▶ Service ──▶ Prisma ──▶ Database
                         │                         │
                    Validation &             Business Logic &
                    HTTP Response            Database Queries
```

| Layer | Responsibility |
|-------|---------------|
| **Routes** | Define HTTP endpoints and map them to controllers |
| **Controllers** | Handle request/response, input validation, HTTP status codes |
| **Services** | Business logic and database operations via Prisma |
| **Config** | Environment variables, database connections, external services |

---

## 🧰 Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Runtime** | Node.js (ESM) | JavaScript runtime with ES modules |
| **Framework** | Fastify 5 | High-performance HTTP server |
| **ORM** | Prisma 7 | Type-safe database client & migrations |
| **Database** | PostgreSQL | Primary data store (via Supabase) |
| **Queue** | BullMQ + IORedis | Background job processing |
| **Auth** | @fastify/jwt | JWT-based authentication |
| **Validation** | Zod 4 | Runtime schema validation |
| **File Upload** | Multer | Multipart form data handling |
| **API Docs** | @fastify/swagger-ui | Interactive API documentation |
| **Package Manager** | pnpm (workspaces) | Monorepo dependency management |
| **Dev Tools** | Nodemon | Hot-reload during development |

---

## 📁 Project Structure

```
VedEngine/
├── apps/
│   ├── backend/                    # Backend API server
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Database schema definitions
│   │   │   └── migrations/         # Database migration files
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── env.config.js       # Environment variables
│   │   │   │   ├── prisma.config.js    # Prisma client instance
│   │   │   │   └── supabase.config.js  # Supabase connection
│   │   │   ├── controller/
│   │   │   │   ├── document.controller.js
│   │   │   │   ├── healthcheck.controller.js
│   │   │   │   └── searchLog.controller.js
│   │   │   ├── routes/
│   │   │   │   ├── document.route.js
│   │   │   │   ├── health.routes.js
│   │   │   │   └── searchLog.route.js
│   │   │   ├── services/
│   │   │   │   ├── document.service.js
│   │   │   │   └── searchLog.service.js
│   │   │   ├── generated/          # Auto-generated Prisma client
│   │   │   ├── app.js              # Fastify app builder & route registration
│   │   │   └── server.js           # Server entry point
│   │   └── package.json
│   └── frontend/                   # Frontend client (TBD)
├── services/
│   └── aiService/                  # AI/ML search service (TBD)
├── packages/                       # Shared packages
├── docs/                           # Documentation
├── infrastructure/                 # Deployment & infra configs
├── pnpm-workspace.yaml             # Workspace configuration
└── package.json                    # Root package config
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 22.x
- **pnpm** ≥ 9.x
- **PostgreSQL** database (or a [Supabase](https://supabase.com/) project)

### 1. Clone the Repository

```bash
git clone https://github.com/Subha12125/VedEngine.git
cd VedEngine
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

Create a `.env` file inside `apps/backend/`:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Fill in the required environment variables (see [Environment Variables](#-environment-variables)).

### 4. Set Up the Database

```bash
cd apps/backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### 5. Start the Development Server

```bash
pnpm --filter backend dev
```

The API will be available at `http://localhost:5000`.

---

## 🔐 Environment Variables

Create a `.env` file in `apps/backend/` with the following variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port number | `5000` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | *required* |

```env
# apps/backend/.env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host:5432/vedengine"
```

---

## 🗃️ Database

### Schema

The database is managed with **Prisma ORM** and consists of the following models:

#### Document

| Column | Type | Description |
|--------|------|-------------|
| `id` | `String (UUID)` | Primary key, auto-generated |
| `title` | `String` | Document title |
| `content` | `String` | Document body content |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

#### SearchLog

| Column | Type | Description |
|--------|------|-------------|
| `id` | `String (UUID)` | Primary key, auto-generated |
| `query` | `String` | The search query string |
| `createdAt` | `DateTime` | When the search was made |
| `updatedAt` | `DateTime` | Last update timestamp |

### Common Prisma Commands

```bash
# Generate client after schema changes
npx prisma generate

# Create and apply a new migration
npx prisma migrate dev --name <migration_name>

# Open Prisma Studio (visual database browser)
npx prisma studio

# Reset the database (⚠️ destructive)
npx prisma migrate reset
```

---

## 📡 API Reference

**Base URL:** `http://localhost:5000/api/v1`

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health status |

---

### 📄 Documents — `/api/v1`

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/create` | Create a new document | `{ title, content }` |
| `GET` | `/all` | Get all documents | — |
| `GET` | `/:id` | Get document by ID | — |
| `GET` | `/` | Search documents by keyword | `?keyword=...` |
| `PUT` | `/:id` | Update a document | `{ title, content }` |
| `DELETE` | `/:id` | Delete a document | — |

#### Example: Create a Document

```bash
curl -X POST http://localhost:5000/api/v1/create \
  -H "Content-Type: application/json" \
  -d '{"title": "Getting Started", "content": "Welcome to VedEngine!"}'
```

#### Example Response

```json
{
  "status": "Created",
  "data": {
    "id": "a1b2c3d4-...",
    "title": "Getting Started",
    "content": "Welcome to VedEngine!",
    "createdAt": "2026-06-19T08:00:00.000Z",
    "updatedAt": "2026-06-19T08:00:00.000Z"
  },
  "success": true
}
```

---

### 🔍 Search Logs — `/api/v1/search-log`

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/` | Log a new search query | `{ query }` |
| `GET` | `/recent` | Get 10 most recent unique searches | — |
| `GET` | `/trending` | Get 10 most frequently searched queries | — |

#### Example: Log a Search

```bash
curl -X POST http://localhost:5000/api/v1/search-log \
  -H "Content-Type: application/json" \
  -d '{"query": "artificial intelligence"}'
```

#### Example: Get Trending Searches

```bash
curl http://localhost:5000/api/v1/search-log/trending
```

#### Example Response

```json
{
  "status": "Success",
  "data": [
    { "query": "machine learning", "_count": { "query": 42 } },
    { "query": "neural networks", "_count": { "query": 31 } }
  ],
  "success": true
}
```

---

## 📜 Scripts

### Backend (`apps/backend`)

| Script | Command | Description |
|--------|---------|-------------|
| **Dev** | `pnpm --filter backend dev` | Start with hot-reload (nodemon) |
| **Start** | `pnpm --filter backend start` | Start in production mode |
| **Test** | `pnpm --filter backend test` | Run tests |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add: amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Convention

```
Add : <description>       # New feature
Fix : <description>       # Bug fix
Update : <description>    # Modification to existing feature
Remove : <description>    # Deletion
Docs : <description>      # Documentation only
```

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

**Built with ❤️ by [Subho](https://github.com/Subha12125)**

</div>
