<div align="center">

# VedEngine

### Enterprise AI-Powered Document Search, Vector Indexing, and RAG Platform

An enterprise-grade, high-performance search and retrieval engine featuring PostgreSQL full-text search, dense vector embeddings, grounded RAG synthesis via Groq Cloud LLM, Upstash Redis caching with in-memory fallback, and a Claude Warm Beige user interface.

[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Groq](https://img.shields.io/badge/Groq_Cloud-API-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![Upstash Redis](https://img.shields.io/badge/Upstash_Redis-v1.38-FF4438?style=for-the-badge&logo=redis&logoColor=white)](https://upstash.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.x-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

---

</div>

## AI and LLM Context Specification (Machine-Readable Architecture Metadata)

> This section provides structured technical metadata to help AI coding assistants, code analyzers, and engineers understand the repository conventions and dependencies.

```json
{
  "project_name": "VedEngine",
  "repository_type": "pnpm workspace monorepo",
  "primary_languages": [
    "JavaScript (ESNext Modules)",
    "Python (FastAPI Microservice)",
    "SQL (PostgreSQL Full-Text Search)"
  ],
  "architecture_pattern": "Decoupled Three-Tier Microservice Monorepo with RESTful Gateway",
  "frontend": {
    "framework": "React 19 (SPA)",
    "bundler": "Vite 8",
    "router": "React Router DOM v7",
    "state_management": "Zustand & React Context API (AuthContext)",
    "query_client": "@tanstack/react-query v5",
    "styling": "TailwindCSS v4 (Custom Claude Warm Beige Theme)",
    "entry_point": "apps/frontend/src/main.jsx"
  },
  "backend": {
    "framework": "Fastify 5",
    "orm": "Prisma 7 with PostgreSQL Provider",
    "cache": "Upstash Redis (@upstash/redis) with automatic in-memory write fallback",
    "auth": "@fastify/jwt & bcrypt password hashing",
    "file_handling": "@fastify/multipart with 10MB stream validation",
    "validation": "Zod 4 schema validation",
    "entry_point": "apps/backend/src/server.js"
  },
  "ai_microservice": {
    "framework": "FastAPI (Python 3.10+)",
    "embedding_model": "sentence-transformers/all-MiniLM-L6-v2 (384 dimensions)",
    "deep_learning_runtime": "PyTorch 2.5+",
    "llm_provider": "Groq Cloud API (qwen/qwen3.8-27b / llama-3.3-70b-versatile)",
    "rag_pipeline": "Semantic retrieval, dense vector re-ranking, and grounded passage synthesis with citation brackets",
    "entry_point": "services/aiService/main.py"
  },
  "database_models": {
    "User": "id (uuid), name, email (unique), password (bcrypt), role ('user'|'admin'), createdAt, updatedAt",
    "Document": "id (uuid), title, content, description, fileName, fileType, fileSize, fileUrl, url, createdAt, updatedAt, search_vector (tsvector)",
    "SearchLog": "id (uuid), query, createdAt, updatedAt"
  },
  "key_conventions": {
    "api_prefix": "/api/v1",
    "ai_api_prefix": "/api/ai",
    "module_type": "ESM (import/export)",
    "full_text_search": "PostgreSQL tsvector, plainto_tsquery, ts_rank, and ts_headline with <mark> tags",
    "fallback_search": "Tokenized keyword matching and substring search (contains, mode: insensitive)",
    "cache_strategy": "Upstash Redis distributed cache with transparent in-memory local fallback for read-only credentials"
  }
}
```

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Directory Map](#project-directory-map)
- [Getting Started and Installation](#getting-started-and-installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup and Seeding](#database-setup-and-seeding)
- [Python AI Microservice Setup](#python-ai-microservice-setup)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Running the Services](#running-the-services)
- [API Reference](#api-reference)
  - [1. Backend Gateway Endpoints (/api/v1)](#1-backend-gateway-endpoints-apiv1)
  - [2. AI Microservice Endpoints (/api/ai)](#2-ai-microservice-endpoints-apiai)
- [Database Schema and Data Models](#database-schema-and-data-models)
- [Design System and UI Theme](#design-system-and-ui-theme)
- [Testing and Quality Assurance](#testing-and-quality-assurance)
- [Troubleshooting Guide](#troubleshooting-guide)
- [License](#license)

---

## Overview

**VedEngine** is an open-source, full-stack, enterprise document search engine and Retrieval-Augmented Generation (RAG) platform. It provides high-performance document indexing, full-text vector matching, dense semantic search, and real-time LLM knowledge synthesis.

The system combines:
1. **Lexical Full-Text Search**: Native PostgreSQL indexing using `to_tsvector`, `ts_rank`, and `ts_headline` with dynamic term highlighting.
2. **Dense Vector Embeddings**: 384-dimensional dense representations powered on-device by PyTorch and HuggingFace SentenceTransformers (`all-MiniLM-L6-v2`).
3. **Groq Cloud LLM RAG Synthesis**: Ultra-low latency grounded answer synthesis using high-throughput models (`qwen/qwen3.8-27b` and `llama-3.3-70b-versatile`) with strict citation brackets (`[1]`, `[2]`).
4. **Resilient Distributed Caching**: Upstash Redis distributed caching with an in-memory fallback layer to guarantee uninterrupted service even if Redis tokens are read-only.
5. **Modern Interface**: Google-style search aesthetics paired with a Claude-inspired Warm Beige theme (`#faf4ec` background, `#fcf8f2` cards, `#d97757` terracotta accents, `#2d2721` charcoal typography).

---

## Key Features

### 1. High-Performance Hybrid Search Engine
- **PostgreSQL Full-Text Search**: Tokenized grammatical indexing using `to_tsvector('english', ...)` and stemmed query evaluation with `plainto_tsquery('english', ...)`.
- **Dynamic Term Highlighting**: Utilizes PostgreSQL `ts_headline` to automatically wrap matched search query terms inside safe HTML `<mark>` badges.
- **Substring and Keyword Fallback**: If strict full-text search returns zero results, the engine automatically extracts salient tokens and falls back to case-insensitive partial matching to ensure zero dead-ends for partial terms (e.g. `clou`, `pyth`).
- **Semantic Re-ranking**: Candidate documents are scored against query vector embeddings using cosine similarity to rank conceptually related items higher.
- **Upstash Redis Cache**: Instant response caching with TTL eviction (24h default) for high-frequency queries to reduce database load.

### 2. Grounded RAG Synthesis with Groq AI
- **Ultra-Fast LLM Inference**: Direct integration with the Groq Cloud API, delivering sub-second grounded completions.
- **Citation Attribution**: Every answer is strictly grounded in retrieved documents with explicit bracket references (`[1]`, `[2]`).
- **Local Fallback Engine**: If the external LLM API is unreachable or rate-limited, the system automatically falls back to an extractive centroid-based synthesis engine to prevent user errors.

### 3. Google-Style Search Result Cards
- **Domain Favicon Integration**: Live high-resolution domain favicons powered by Google's Favicon API.
- **Breadcrumb Navigation**: Visual URL hierarchy representation (`domain.com › section › subpath`).
- **Direct Website Redirection**: One-click "Visit Website" action buttons opening external links safely in new browser tabs (`target="_blank" rel="noopener noreferrer"`).
- **Auto-Suggestions**: Debounced auto-complete suggestion menu rendering matching indexed page titles as users type.

### 4. Role-Based Access Control (RBAC)
- **Public Visitors & Normal Users (`role: "user"`)**: Access to instant public search, auto-suggestions, pagination, and sorting filter controls.
- **Administrators (`role: "admin"`)**: Exclusive privileges to upload TXT/PDF/DOCX documents, trigger document creation, manage indexed documents (`/documents`), and audit search query trends (`/analytics`).

### 5. Document Management & Ingestion Pipeline
- **Multi-Format Ingestion**: Supports `.txt`, `.pdf`, and `.docx` file uploads via `@fastify/multipart` with a hard 10 MB stream size limit.
- **Cheerio Web Scraper**: Automatic link extraction, title normalization, and text parsing for indexing web documents.
- **Text Chunking**: Sliding-window chunker with sentence boundary detection and customizable character overlaps for dense indexing.

### 6. Real-Time Analytics & Audit Tracking
- **Search Query Logging**: Automatically records every query string in the `SearchLog` database model.
- **Analytics Dashboard**: Aggregates top search terms, total search operations, system metrics, and index counts.

---

## System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer["Frontend Client (apps/frontend - React 19 + Vite 8)"]
        UI["Search Interface / Dashboard"]
        Router["React Router DOM v7 (AppRoutes)"]
        AuthCtx["AuthContext (JWT State)"]
        Components["Searchbar | SearchResult | UploadModal | Navbar"]
    end

    subgraph APILayer["Backend Gateway (apps/backend - Fastify 5)"]
        App["Fastify Application Gateway (app.js)"]
        Cors["CORS, Multipart & JWT Plugins"]
        Routes["Routes: /search, /documents, /auth, /analytics, /upload"]
        Middleware["Auth & Zod Validation Middleware"]
    end

    subgraph ServiceLayer["Core Services Layer"]
        SearchService["Search Service (FTS + Fallback)"]
        DocService["Document Management Service"]
        AuthService["Auth Service (Bcrypt + JWT)"]
        AnalyticsService["Analytics & SearchLog Service"]
        AIClient["Internal AI Microservice Client (HTTP)"]
        Scraper["Web Scraper (Cheerio + Axios)"]
    end

    subgraph AIServiceLayer["AI Microservice (services/aiService - FastAPI)"]
        EmbeddingEngine["SentenceTransformers (all-MiniLM-L6-v2)"]
        CosineRanker["Vector Similarity & Re-ranker"]
        RAGEngine["RAG Synthesis Engine"]
        GroqAPI["Groq Cloud LLM API (Qwen / LLaMA)"]
    end

    subgraph DataLayer["Persistence & Caching"]
        Redis[("Upstash Redis Cache\nKey: search:<query>:page:<p>:limit:<l>")]
        PostgreSQL[("PostgreSQL Database\nModels: User, Document, SearchLog\nIndex: tsvector / GIN")]
    end

    UI -->|HTTP Requests / JSON| App
    App --> Cors
    App --> Routes
    Routes --> Middleware
    Middleware --> ServiceLayer

    SearchService -->|1. Check Cache| Redis
    SearchService -->|2. Full-Text Query / Fallback| PostgreSQL
    SearchService -->|3. Request RAG / Vectors| AIClient

    AIClient -->|REST / Port 8000| AIServiceLayer
    AIServiceLayer --> EmbeddingEngine
    AIServiceLayer --> CosineRanker
    AIServiceLayer --> RAGEngine
    RAGEngine -->|Chat Completions| GroqAPI

    DocService -->|CRUD Operations| PostgreSQL
    AuthService -->|User Lookup / Password Verification| PostgreSQL
    AnalyticsService -->|SearchLog Aggregations| PostgreSQL
    Scraper -->|Extract Web Text| DocService
```

---

## Technology Stack

| Category | Technology | Version | Description |
| :--- | :--- | :--- | :--- |
| **Monorepo Manager** | pnpm | 9.x+ | Monorepo package management and workspace linking |
| **Frontend Framework** | React | 19.2 | Component-based UI library |
| | Vite | 8.0 | Next-generation frontend build tool and dev server |
| | React Router DOM | 7.1 | Client-side routing and RBAC route guards |
| | Tailwind CSS | 4.3 | Utility-first CSS framework with Claude Warm Beige theme |
| | Zustand & Context | 5.0 | Global state and authentication session handling |
| | Axios | 1.18 | Asynchronous HTTP client |
| **Backend Framework** | Node.js | 22.x+ | JavaScript runtime environment |
| | Fastify | 5.8 | Low-overhead, high-throughput Node.js HTTP framework |
| | Prisma ORM | 7.8 | Type-safe PostgreSQL client and migration manager |
| | PostgreSQL | 16+ | Relational data store and native full-text search engine |
| | Upstash Redis | 1.38 | Serverless REST-based Redis cache |
| | @fastify/jwt | 10.1 | JWT token generation and verification |
| | bcrypt | 6.0 | Password hashing and security |
| | @fastify/multipart | 9.0 | Streaming file upload parser |
| | Cheerio | 1.2 | HTML parsing and web scraping utility |
| | Zod | 4.4 | Request payload and query parameter validation |
| | Vitest | 3.2 | Fast unit and integration test runner |
| **AI Microservice** | Python | 3.10+ | AI microservice runtime |
| | FastAPI | 0.115 | Asynchronous REST microservice framework |
| | PyTorch | 2.5+ | Deep learning runtime (CPU/CUDA) |
| | SentenceTransformers | 3.4+ | `all-MiniLM-L6-v2` dense embedding model (384 dimensions) |
| | HTTPX | 0.28 | Asynchronous HTTP client for Groq API integration |
| | Groq Cloud | API v1 | High-throughput LLM inference engine |

---

## Project Directory Map

```
VedEngine/
├── package.json                               # Monorepo root manifest and shared scripts
├── pnpm-workspace.yaml                         # Workspace definitions (apps/*)
├── apps/
│   ├── backend/                               # Fastify 5 Node.js Application Gateway
│   │   ├── prisma/
│   │   │   ├── schema.prisma                  # Prisma Schema (User, Document, SearchLog)
│   │   │   └── migrations/                    # PostgreSQL schema migration history
│   │   ├── src/
│   │   │   ├── config/                        # Configuration modules
│   │   │   │   ├── env.config.js              # Environment variable loading
│   │   │   │   ├── prisma.config.js           # Prisma client singleton
│   │   │   │   └── redis.config.js            # Upstash Redis client with in-memory fallback
│   │   │   ├── controller/                    # Request handlers
│   │   │   │   ├── analytics.controller.js    # Search metrics and audit log controller
│   │   │   │   ├── auth.controller.js         # Register, login, and profile controller
│   │   │   │   ├── document.controller.js     # Document CRUD controller
│   │   │   │   ├── search.controller.js       # Search, AI search, and suggestions controller
│   │   │   │   ├── searchLog.controller.js    # Search history logging controller
│   │   │   │   └── upload.controller.js       # Multipart file ingestion controller
│   │   │   ├── middlewares/                   # Fastify middleware
│   │   │   │   └── auth.middleware.js         # JWT verification and RBAC check
│   │   │   ├── routes/                        # API route definitions
│   │   │   │   ├── analytics.route.js         # /api/v1/analytics
│   │   │   │   ├── auth.route.js              # /api/v1/auth
│   │   │   │   ├── document.route.js          # /api/v1/documents
│   │   │   │   ├── health.routes.js           # /health
│   │   │   │   ├── search.route.js            # /api/v1/search
│   │   │   │   ├── searchLog.route.js         # /api/v1/search-log
│   │   │   │   └── upload.route.js            # /api/v1/upload
│   │   │   ├── scripts/                       # Database seed and admin creation scripts
│   │   │   │   ├── create_admin.js            # Script to initialize admin user
│   │   │   │   ├── seed2.js                   # Seed script variant
│   │   │   │   ├── seed_general_data.js       # 56+ curated topics (Tech, Science, History)
│   │   │   │   ├── seed_general_data_expanded.js # Expanded web standards and concepts
│   │   │   │   └── seed_social_media.js       # Social networks and platform topics
│   │   │   ├── services/                      # Service business logic
│   │   │   │   ├── ai.service.js              # Internal client for Python AI microservice
│   │   │   │   ├── analytics.service.js       # Aggregations for search analytics
│   │   │   │   ├── auth.service.js            # Bcrypt hashing and authentication
│   │   │   │   ├── cache.service.js           # Cache invalidation and key scanning
│   │   │   │   ├── document.service.js        # Document query and mutation services
│   │   │   │   ├── search.service.js          # PostgreSQL FTS and keyword fallback search
│   │   │   │   ├── searchLog.service.js       # Asynchronous search logging
│   │   │   │   └── upload.service.js          # File storage and metadata processing
│   │   │   ├── utils/                         # Helper utilities
│   │   │   │   └── webScraper.utils.js        # Cheerio web scraper utility
│   │   │   ├── validators/                    # Zod runtime validation schemas
│   │   │   │   ├── auth.validator.js
│   │   │   │   ├── document.validator.js
│   │   │   │   ├── search.validator.js
│   │   │   │   └── upload.validator.js
│   │   │   ├── app.js                         # Fastify application builder and plugin registration
│   │   │   └── server.js                      # HTTP server startup entry point
│   │   ├── tests/                             # Vitest test suite (47 tests)
│   │   ├── package.json
│   │   └── vitest.config.js                   # Vitest configuration
│   │
│   └── frontend/                              # React 19 Single Page Application
│       ├── src/
│       │   ├── assets/                        # Static branding assets and logos
│       │   ├── components/                    # Reusable React components
│       │   │   ├── Loading.jsx                # Full-screen and inline loading spinner
│       │   │   ├── Navbar.jsx                 # Navigation header and authentication controls
│       │   │   ├── Searchbar.jsx              # Search input with debounced suggestions
│       │   │   ├── SearchResult.jsx           # Result cards with favicons, badges, and snippets
│       │   │   └── UploadModal.jsx            # Modal dialog for uploading files and URLs
│       │   ├── context/                       # React Context API
│       │   │   └── AuthContext.jsx            # JWT authentication state provider
│       │   ├── pages/                         # Routed application pages
│       │   │   ├── Analytics.jsx              # Audit tracking and query metrics dashboard
│       │   │   ├── Dashboard.jsx              # Public search engine interface
│       │   │   ├── Documents.jsx              # Document management portal
│       │   │   ├── Login.jsx                  # User and admin login page
│       │   │   └── Register.jsx               # New user registration page
│       │   ├── routes/                        # Client-side routing
│       │   │   └── AppRoutes.jsx              # Route definitions and RBAC protection guards
│       │   ├── services/                      # Axios HTTP client configuration
│       │   │   └── api.js                     # Unified API service layer
│       │   ├── App.jsx                        # Root React layout component
│       │   ├── index.css                      # TailwindCSS v4 design tokens and utilities
│       │   └── main.jsx                       # React DOM mount entry point
│       ├── package.json
│       └── vite.config.js                     # Vite build and proxy settings
│
└── services/
    └── aiService/                             # Python FastAPI AI & RAG Microservice
        ├── main.py                            # FastAPI ASGI entry point
        ├── requirements.txt                   # Python dependencies manifest
        ├── app/
        │   ├── config.py                      # Pydantic Settings (embeddings, Groq, ports)
        │   ├── api/
        │   │   └── routes.py                  # API endpoints (/api/ai/*)
        │   ├── models/
        │   │   └── schemas.py                 # Pydantic request and response models
        │   └── services/
        │       ├── embedding_service.py       # SentenceTransformers embedding generation
        │       └── rag_service.py             # Groq LLM caller, chunker, and summarizer
        └── tests/
            ├── test_ai_service.py             # 13 automated unit tests
            └── run_tests.py                   # Python test suite runner
```

---

## Getting Started and Installation

### Prerequisites

Ensure the following tools are installed on your workstation:
- **Node.js**: `v22.0.0` or higher
- **pnpm**: `v9.0.0` or higher (`npm install -g pnpm`)
- **Python**: `v3.10`, `v3.11`, or `v3.12` with `pip` and `venv`
- **PostgreSQL**: `v16.0` or higher (Local installation, Supabase, or Neon)
- **Upstash Redis**: An active database on [Upstash](https://upstash.com/)
- **Groq API Key**: An active key from [Groq Console](https://console.groq.com/)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Subha12125/VedEngine.git
cd VedEngine
```

---

### Step 2: Install Monorepo Dependencies

Execute `pnpm install` in the root directory to install all packages for both the backend and frontend:

```bash
pnpm install
```

---

## Environment Configuration

Configure environment variable files for each of the three tiers:

### 1. Backend Environment Configuration (`apps/backend/.env`)

Create or update `apps/backend/.env`:

```env
PORT=3000
NODE_ENV=development

# PostgreSQL Connection Strings (Supabase / Standard PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/vedengine?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/vedengine?schema=public"

# Upstash Redis Cache Credentials
UPSTASH_REDIS_REST_URL="https://quick-grubworm-240233.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_read_write_token_here"

# Authentication
JWT_SECRET="super_secret_jwt_signature_key_change_in_production"
JWT_EXPIRES_IN="7d"

# Internal Microservice Routing
AI_SERVICE_URL="http://localhost:8000"
GROQ_API_KEY="gsk_your_groq_api_key_here"
```

### 2. Frontend Environment Configuration (`apps/frontend/.env`)

Create or update `apps/frontend/.env`:

```env
# Fastify Backend API Base URL
VITE_API_URL="http://localhost:3000/api/v1"
```

### 3. AI Microservice Configuration (`services/aiService/.env`)

Create or update `services/aiService/.env`:

```env
# VedEngine AI Microservice Configuration
SERVICE_NAME="VedEngine AI Service"
VERSION="1.0.0"
HOST="0.0.0.0"
PORT=8000
DEBUG=False

# Dense Embedding Configuration
EMBEDDING_MODEL_NAME="all-MiniLM-L6-v2"
EMBEDDING_DIMENSION=384

# LLM & RAG Provider Settings (Groq Cloud API)
LLM_PROVIDER="groq"
GROQ_API_KEY="gsk_your_groq_api_key_here"
GROQ_BASE_URL="https://api.groq.com/openai/v1"
GROQ_MODEL="qwen/qwen3.8-27b"
```

---

## Database Setup and Seeding

Navigate to the backend directory:

```bash
cd apps/backend
```

### 1. Generate Prisma Client and Push Schema

```bash
# Generate the type-safe Prisma client
npx prisma generate

# Push the schema definitions directly to your PostgreSQL database
npx prisma db push
```

### 2. Seed Knowledge Base Datasets

VedEngine includes multiple comprehensive seed scripts to populate your database with reference articles across Technology, Science, History, and Social Platforms:

```bash
# 1. Populate General Knowledge Base (56+ curated topics: Tech, History, Science)
node --experimental-strip-types src/scripts/seed_general_data.js

# 2. Populate Expanded Knowledge Base (Web Standards, Programming Languages)
node --experimental-strip-types src/scripts/seed_general_data_expanded.js

# 3. Populate Social Media Knowledge Base (Networks, Architecture Concepts)
node --experimental-strip-types src/scripts/seed_social_media.js
```

### 3. Initialize Default Administrator Account

Create the initial administrator account required for uploading documents and viewing analytics:

```bash
node --experimental-strip-types src/scripts/create_admin.js
```

Default administrator credentials created by the script:
- **Email**: `subha@example.com`
- **Password**: `Subha@12125`
- **Role**: `admin`

---

## Python AI Microservice Setup

Navigate to the AI service directory and initialize the virtual environment:

```bash
cd services/aiService
```

### Windows (PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

### Linux / macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## Role-Based Access Control (RBAC)

VedEngine enforces strict role-based separation between public search visitors and administrators:

| Permission / Action | Public Visitor | Registered User (`role: "user"`) | Administrator (`role: "admin"`) |
| :--- | :---: | :---: | :---: |
| Execute Search Queries | Yes | Yes | Yes |
| Auto-Complete Suggestions | Yes | Yes | Yes |
| View Favicons, Badges & Snippets | Yes | Yes | Yes |
| Filter & Sort Results | Yes | Yes | Yes |
| Request Grounded Groq RAG Answers | Yes | Yes | Yes |
| Upload Files (PDF / TXT / DOCX) | No | No | Yes |
| Create Web Documents via URL | No | No | Yes |
| Access Document Management (`/documents`) | No | No | Yes |
| Delete Indexed Documents | No | No | Yes |
| View Search Audit Analytics (`/analytics`) | No | No | Yes |

---

## Running the Services

Run each service in a dedicated terminal window:

### Terminal 1: Python AI Microservice (Port 8000)

```bash
cd services/aiService
# Windows
.\.venv\Scripts\uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Linux / macOS
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*Health Check: Verify at `http://localhost:8000/health`*

### Terminal 2: Backend Gateway (Port 3000)

```bash
cd apps/backend
npm run dev
```
*API Base: `http://localhost:3000/api/v1`*

### Terminal 3: Frontend Client (Port 5173)

```bash
cd apps/frontend
npm run dev
```
*Web Application: `http://localhost:5173`*

---

## API Reference

### 1. Backend Gateway Endpoints (`/api/v1`)

#### Health Check

`GET /health`
- **Authentication**: None
- **Response `200 OK`**:
```json
{
  "status": "ok",
  "uptime": 120.45,
  "timestamp": "2026-10-27T19:30:00.000Z"
}
```

---

#### Search Endpoints

`GET /search`
Performs PostgreSQL full-text search with vector ranking, dynamic term highlighting, pagination, and keyword fallback matching.
- **Authentication**: None
- **Query Parameters**:
  - `q` (string, required): Search query term (e.g. `quantum computing`)
  - `page` (number, optional, default: `1`): Current page
  - `limit` (number, optional, default: `10`): Items per page
  - `sort` (string, optional, default: `"newest"`): `"newest"` or `"oldest"`
  - `ai` (boolean, optional, default: `false`): Set to `true` to request Groq RAG synthesis
  - `from` (ISO date, optional): Filter documents created after this date
  - `to` (ISO date, optional): Filter documents created before this date
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Documents found successfully",
  "query": "quantum computing",
  "page": 1,
  "limit": 10,
  "total": 1,
  "totalPages": 1,
  "data": [
    {
      "id": "c7b84852-19e4-4a4e-862d-0599a0f443b2",
      "title": "Quantum Photonics and Entangled Waveguides",
      "description": "Silicon photonic quantum chips and teleportation protocols",
      "url": null,
      "fileType": "text/plain",
      "fileName": "quantum.txt",
      "fileUrl": "./uploads/quantum.txt",
      "snippet": "...optical <mark>quantum</mark> <mark>computing</mark>, photonic chips route entangled photons...",
      "createdAt": "2026-10-27T01:00:00.000Z",
      "updatedAt": "2026-10-27T01:00:00.000Z",
      "rank": 0.895
    }
  ],
  "aiAnswer": "Photonic chips route photons through dielectric waveguides to perform state transformations [1].",
  "aiSources": [
    {
      "index": 1,
      "title": "Quantum Photonics and Entangled Waveguides"
    }
  ],
  "aiConfidence": 0.7233,
  "timeTake": 42
}
```

`GET /search/ai`
Executes direct semantic search over indexed documents and synthesizes a grounded answer using the Python AI service and Groq Cloud LLM.
- **Authentication**: None
- **Query Parameters**:
  - `q` (string, required): Natural language search question
  - `limit` (number, optional, default: `5`): Maximum candidate documents to consider
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "AI semantic search and RAG synthesis completed",
  "query": "how do photonic chips route photons",
  "aiAnswer": "Photonic chips route photons in quantum computing by guiding entangled photons through dielectric waveguides [1]. This enables state transformations with minimal decoherence [1].",
  "sources": [
    {
      "index": 1,
      "title": "Quantum Photonics and Entangled Waveguides",
      "snippet": "In optical quantum computing, photonic chips route entangled photons through dielectric waveguides...",
      "relevance_score": 0.5145
    }
  ],
  "confidence": 0.5145,
  "provider": "groq/qwen/qwen3.8-27b",
  "data": [
    {
      "id": "c7b84852-19e4-4a4e-862d-0599a0f443b2",
      "title": "Quantum Photonics and Entangled Waveguides",
      "score": 0.5145
    }
  ],
  "timeTake": 845
}
```

`GET /search/suggestions`
Provides fast auto-complete suggestions based on query substrings.
- **Authentication**: None
- **Query Parameters**:
  - `q` (string, required): Query prefix
- **Response `200 OK`**:
```json
[
  {
    "id": "c7b84852-19e4-4a4e-862d-0599a0f443b2",
    "title": "Quantum Photonics and Entangled Waveguides",
    "url": null
  }
]
```

---

#### Authentication Endpoints

`POST /auth/register`
Registers a new user account.
- **Authentication**: None
- **Request Body (`application/json`)**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Response `201 Created`**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user-uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}
```

`POST /auth/login`
Authenticates a user and issues a signed JWT bearer token.
- **Authentication**: None
- **Request Body (`application/json`)**:
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Response `200 OK`**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}
```

`GET /auth/profile`
Retrieves the authenticated user's session profile.
- **Authentication**: Bearer Token (`Authorization: Bearer <token>`)
- **Response `200 OK`**:
```json
{
  "user": {
    "id": "user-uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "createdAt": "2026-10-27T01:00:00.000Z"
  }
}
```

---

#### Document Management Endpoints

`GET /documents`
Retrieves a paginated list of indexed documents.
- **Authentication**: None
- **Query Parameters**: `page`, `limit`
- **Response `200 OK`**: Array of document records with pagination metadata.

`GET /documents/:id`
Retrieves full details of a specific document by UUID.
- **Authentication**: None
- **Response `200 OK`**: Document object.

`POST /documents`
Creates a document manually or indexes a page via URL link.
- **Authentication**: Admin Bearer Token
- **Request Body (`application/json`)**:
```json
{
  "title": "React Documentation",
  "content": "React is a JavaScript library for building user interfaces.",
  "url": "https://react.dev",
  "description": "Official React website documentation"
}
```
- **Response `201 Created`**: Created document object.

`POST /upload`
Uploads a document file (`.txt`, `.pdf`, `.docx`) for automatic text extraction and indexing.
- **Authentication**: Admin Bearer Token
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `file`: File binary (Maximum 10 MB)
  - `title`: (Optional) Document title
  - `description`: (Optional) Description text
- **Response `201 Created`**:
```json
{
  "message": "File uploaded and indexed successfully",
  "document": {
    "id": "doc-uuid",
    "title": "Quantum Computing Primer",
    "fileName": "quantum.pdf",
    "fileType": "application/pdf",
    "fileSize": 245120
  }
}
```

`DELETE /documents/:id`
Deletes an indexed document and invalidates search caches.
- **Authentication**: Admin Bearer Token
- **Response `200 OK`**:
```json
{
  "message": "Document deleted successfully"
}
```

---

#### Analytics Endpoints

`GET /analytics/search`
Retrieves aggregated search statistics, query volume, and index metrics.
- **Authentication**: Admin Bearer Token
- **Response `200 OK`**:
```json
{
  "totalSearches": 1420,
  "topQueries": [
    { "query": "javascript", "count": 210 },
    { "query": "quantum computing", "count": 185 },
    { "query": "react", "count": 140 }
  ]
}
```

`GET /search-log/trending`
Returns the top 5 most frequently searched terms across the platform.
- **Authentication**: None
- **Response `200 OK`**:
```json
[
  { "query": "quantum computing", "count": 185 },
  { "query": "javascript", "count": 142 },
  { "query": "react", "count": 115 }
]
```

---

### 2. AI Microservice Endpoints (`/api/ai`)

Base URL: `http://localhost:8000/api/ai`

`POST /embed`
Generates a dense vector embedding for an input string.
- **Request Body**:
```json
{
  "text": "Dielectric waveguides routing entangled photons."
}
```
- **Response `200 OK`**:
```json
{
  "dimensions": 384,
  "embedding": [0.0215, -0.0431, 0.0812, 0.0054, ...]
}
```

`POST /embed/batch`
Generates vector embeddings for a list of texts in a single batch pass.
- **Request Body**:
```json
{
  "texts": [
    "First sentence to embed",
    "Second sentence to embed"
  ]
}
```
- **Response `200 OK`**:
```json
{
  "count": 2,
  "dimensions": 384,
  "embeddings": [
    [0.0215, -0.0431, ...],
    [0.0112, -0.0298, ...]
  ]
}
```

`POST /similarity`
Computes the cosine similarity between two text passages.
- **Request Body**:
```json
{
  "text1": "Fastify web framework for Node.js",
  "text2": "High performance HTTP server in JavaScript"
}
```
- **Response `200 OK`**:
```json
{
  "similarity": 0.7842
}
```

`POST /semantic-search`
Ranks a list of candidate documents against a query using dense vector cosine similarity.
- **Request Body**:
```json
{
  "query": "light particles quantum computing circuit",
  "documents": [
    {
      "id": "doc-1",
      "title": "Quantum Photonics",
      "content": "Photonic chips route entangled photons through dielectric waveguides."
    },
    {
      "id": "doc-2",
      "title": "History of Rome",
      "content": "The Roman Republic was founded in 509 BC."
    }
  ],
  "top_k": 2
}
```
- **Response `200 OK`**:
```json
{
  "results": [
    {
      "id": "doc-1",
      "title": "Quantum Photonics",
      "score": 0.5145
    },
    {
      "id": "doc-2",
      "title": "History of Rome",
      "score": 0.0421
    }
  ]
}
```

`POST /rag/answer`
Executes Retrieval-Augmented Generation (RAG) by assembling context passages and calling Groq Cloud LLM.
- **Request Body**:
```json
{
  "query": "How do photonic chips route photons in quantum computing?",
  "documents": [
    {
      "id": "doc-1",
      "title": "Quantum Photonics",
      "content": "In optical quantum computing, photonic chips route entangled photons through dielectric waveguides to perform state transformations with minimal decoherence."
    }
  ],
  "max_tokens": 512
}
```
- **Response `200 OK`**:
```json
{
  "query": "How do photonic chips route photons in quantum computing?",
  "answer": "Photonic chips route photons in quantum computing by guiding entangled photons through dielectric waveguides [1]. This enables state transformations while maintaining minimal decoherence [1].",
  "sources": [
    {
      "index": 1,
      "title": "Quantum Photonics",
      "snippet": "In optical quantum computing, photonic chips route entangled photons...",
      "relevance_score": 0.7233
    }
  ],
  "confidence": 0.7233,
  "provider": "groq/qwen/qwen3.8-27b"
}
```

`POST /chunk`
Splits large text into overlapping sentence chunks respecting paragraph boundaries.
- **Request Body**:
```json
{
  "text": "Long document text goes here...",
  "chunk_size": 500,
  "chunk_overlap": 50
}
```
- **Response `200 OK`**:
```json
{
  "total_chunks": 3,
  "chunks": [
    {
      "chunk_index": 0,
      "text": "First chunk text...",
      "start_char": 0,
      "end_char": 480,
      "char_count": 480
    }
  ]
}
```

`POST /summarize`
Generates an extractive summary of long text by scoring sentence embeddings against the global document centroid vector.
- **Request Body**:
```json
{
  "text": "Lengthy article with several paragraphs...",
  "max_sentences": 3
}
```
- **Response `200 OK`**:
```json
{
  "summary": "Key summary sentence 1. Key summary sentence 2.",
  "original_length": 2450,
  "summary_length": 340,
  "reduction_ratio": 0.138
}
```

`POST /query/expand`
Enriches technical queries with conceptual synonyms and related keywords.
- **Request Body**:
```json
{
  "query": "fastify"
}
```
- **Response `200 OK`**:
```json
{
  "original_query": "fastify",
  "expanded_terms": ["node.js", "http server", "rest api", "plugins", "microservices"],
  "enhanced_query": "fastify node.js http server rest api plugins microservices"
}
```

---

## Database Schema and Data Models

Prisma Schema Location: `apps/backend/prisma/schema.prisma`

### 1. `User` Model
Stores registered accounts and administrative privileges.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(uuid())` | Unique user identifier (UUID v4) |
| `name` | `String` | — | User's full display name |
| `email` | `String` | `@unique` | Unique email address for login |
| `password` | `String` | — | Bcrypt-hashed password string |
| `role` | `String` | `@default("user")` | Authority level (`"user"` or `"admin"`) |
| `createdAt` | `DateTime` | `@default(now())` | Account creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Account modification timestamp |

### 2. `Document` Model
Stores indexed web pages, uploaded files, and reference articles.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(uuid())` | Unique document identifier (UUID v4) |
| `title` | `String` | — | Document or web page title |
| `content` | `String` | — | Full raw text body used for search and RAG |
| `description` | `String?` | Optional | Summary preview of document content |
| `fileName` | `String?` | Optional | Original uploaded file name |
| `fileType` | `String?` | Optional | MIME type (`application/pdf`, `text/plain`) |
| `fileSize` | `Int?` | Optional | File size in bytes |
| `fileUrl` | `String?` | Optional | Storage location link |
| `url` | `String?` | Optional | Source web URL |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Modification timestamp |

### 3. `SearchLog` Model
Captures user query history for analytics and trending calculations.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(uuid())` | Unique log entry identifier (UUID v4) |
| `query` | `String` | — | Raw search query string |
| `createdAt` | `DateTime` | `@default(now())` | Timestamp of query execution |
| `updatedAt` | `DateTime` | `@updatedAt` | Modification timestamp |

---

## Design System and UI Theme

VedEngine implements a **Claude-Inspired Warm Beige** design system configured via TailwindCSS v4:

```css
/* Color Palette Specifications */
--color-bg-main:       #faf4ec; /* Warm Parchment Beige Background */
--color-card-bg:       #fcf8f2; /* Cream Card Component Background */
--color-terracotta:    #d97757; /* Terracotta Accent & Highlight Color */
--color-charcoal:      #2d2721; /* Dark Charcoal Primary Typography */
--color-muted-border:  #e6ded4; /* Soft Warm Border Stroke */
```

### Key UI Features
- **Responsive Layout**: Designed for seamless rendering across desktop, tablet, and mobile screens.
- **Glassmorphism Navigation**: Floating frosted glass header with translucent background blur.
- **Interactive Micro-Animations**: Smooth hover transitions, active search focus glow, and animated modal dialogs.
- **Dynamic Term Highlighting**: PostgreSQL `<mark>` tags styled with warm terracotta highlight backgrounds.

---

## Testing and Quality Assurance

### 1. Backend Integration Tests (Vitest)

The backend includes 47 automated tests covering authentication, search operations, document mutations, cache invalidation, and analytics:

```bash
cd apps/backend
npm test
```

### 2. AI Microservice Tests (Python)

The AI microservice includes 13 unit tests verifying embedding generation, similarity scoring, RAG synthesis, and Groq API calls:

```bash
cd services/aiService
# Windows
.\.venv\Scripts\python.exe tests/run_tests.py

# Linux / macOS
python tests/run_tests.py
```

### 3. End-to-End Workflow Verification

A live integration test that verifies database document creation, embedding generation, semantic retrieval, Groq RAG synthesis, and automatic document cleanup:

```bash
cd apps/backend
node tests/e2e_ai_workflow.js
```

### 4. Frontend Production Build Validation

Verifies that the React application builds cleanly with zero errors:

```bash
cd apps/frontend
npm run build
```

---

## Troubleshooting Guide

### 1. Upstash Redis Returns `NOPERM this user has no permissions to run the 'set' command`
- **Cause**: The token in `UPSTASH_REDIS_REST_TOKEN` is the read-only token (`UPSTASH_REDIS_REST_READ_ONLY_TOKEN`).
- **Solution**: Go to the Upstash Console, select your database, click the **REST API** section, select the **.env** tab, and copy the primary `UPSTASH_REDIS_REST_TOKEN` (Read-Write). VedEngine includes an in-memory fallback to prevent crashes while you update this key.

### 2. Groq LLM Call Returns `404 Not Found: model_not_found`
- **Cause**: The requested model name is not available for your Groq API key tier.
- **Solution**: Set `GROQ_MODEL=qwen/qwen3.8-27b` in `services/aiService/.env`. The service automatically falls back to local extractive summarization if any LLM call fails.

### 3. PostgreSQL Full-Text Search Returns 0 Results for Multi-Word Questions
- **Cause**: PostgreSQL's `plainto_tsquery` applies boolean `AND` across all stemmed query words. If a single word is absent from the document, the strict match fails.
- **Solution**: VedEngine includes an automatic fallback that extracts salient keywords and performs substring and OR matching so relevant documents are always retrieved.

### 4. Port 8000 or Port 3000 Already in Use
- **Windows**:
  ```powershell
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```
- **Linux / macOS**:
  ```bash
  lsof -i :3000
  kill -9 <PID>
  ```

---

## License

This project is open-source software licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**VedEngine Search Platform**

</div>
