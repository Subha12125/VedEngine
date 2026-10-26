# 🤖 VedEngine AI Service

High-performance microservice providing dense vector embeddings, semantic search, cosine similarity ranking, document chunking, extractive summarization, query expansion, and Retrieval-Augmented Generation (RAG) for the **VedEngine** search platform.

---

## ⚡ Core Capabilities

- **Vector Embeddings (`/api/ai/embed`, `/api/ai/embed/batch`)**:
  - Dense 384-dimensional normalized vector representations using `all-MiniLM-L6-v2`.
  - Batch embedding processing with PyTorch / NumPy acceleration.
- **Semantic Vector Search (`/api/ai/semantic-search`)**:
  - Computes cosine similarity scores across candidate documents and returns ranked results.
- **Search Re-ranking (`/api/ai/rerank`)**:
  - Re-evaluates search result sets against user queries using semantic embedding similarity.
- **RAG Answer Synthesis (`/api/ai/rag/answer`)**:
  - Extracts and ranks context passages against the search query.
  - Generates structured answers with bracket citations `[1]`, `[2]`.
  - Supports hybrid execution: 100% offline local extractive synthesis out-of-the-box or pluggable OpenAI / Ollama LLM integration.
- **Document Chunking (`/api/ai/chunk`)**:
  - Sentence-boundary-aware overlapping text chunking for optimal vector database indexing.
- **Extractive Summarization (`/api/ai/summarize`)**:
  - Computes sentence embeddings against global document centroid to generate high-density previews.
- **Query Expansion (`/api/ai/query/expand`)**:
  - Enriches queries with technical synonyms and conceptual keywords to maximize search recall.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Virtual environment (`.venv`)

### 2. Installation
```bash
cd services/aiService
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configurable variables:
| Variable | Default | Description |
|---|---|---|
| `PORT` | `8000` | Port for FastAPI server |
| `EMBEDDING_MODEL_NAME` | `all-MiniLM-L6-v2` | SentenceTransformers model name |
| `LLM_PROVIDER` | `local` | `local`, `openai`, or `ollama` |
| `OPENAI_API_KEY` | `""` | Optional API key for OpenAI GPT models |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model identifier |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama local endpoint |
| `OLLAMA_MODEL` | `llama3.2` | Ollama model name |

### 4. Running the Service
```bash
.\.venv\Scripts\python.exe main.py
```
or via Uvicorn:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation will be available at: **http://localhost:8000/docs**

---

## 📡 API Reference

### Health & Metadata
- `GET /health`: Health status and device (CPU/CUDA).
- `GET /api/ai/info`: Model metadata, dimension, device, and capabilities.

### Embeddings
- `POST /api/ai/embed`: Generate single text embedding.
  ```json
  { "text": "PostgreSQL full text search" }
  ```
- `POST /api/ai/embed/batch`: Generate embeddings for multiple texts.
  ```json
  { "texts": ["Document 1", "Document 2"] }
  ```

### Semantic Search & Re-ranking
- `POST /api/ai/semantic-search`:
  ```json
  {
    "query": "relational database engine",
    "documents": [
      { "id": "1", "title": "PostgreSQL", "content": "PostgreSQL is an advanced object-relational database." },
      { "id": "2", "title": "React", "content": "React is a JavaScript library for building user interfaces." }
    ],
    "top_k": 5
  }
  ```

### RAG Synthesis
- `POST /api/ai/rag/answer`:
  ```json
  {
    "query": "What is VedEngine?",
    "documents": [
      { "title": "Architecture", "content": "VedEngine is a vector-powered search engine built with PostgreSQL, Fastify, and React." }
    ]
  }
  ```

### Utilities
- `POST /api/ai/chunk`: Text chunking with overlap.
- `POST /api/ai/summarize`: Extractive document summarization.
- `POST /api/ai/query/expand`: Query expansion.

---

## 🧪 Testing

Run the test suite:
```bash
.\.venv\Scripts\python.exe tests/run_tests.py
```
