import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "VedEngine" in data["service"]


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "embed" in data["endpoints"]


def test_info():
    response = client.get("/api/ai/info")
    assert response.status_code == 200
    data = response.json()
    assert data["embedding_dimension"] == 384
    assert "single_embedding" in data["capabilities"]


def test_embed():
    response = client.post("/api/ai/embed", json={"text": "PostgreSQL full text search and vector indexing"})
    assert response.status_code == 200
    data = response.json()
    assert "embedding" in data
    assert data["dimensions"] == 384
    assert len(data["embedding"]) == 384


def test_embed_empty_validation():
    response = client.post("/api/ai/embed", json={"text": "   "})
    assert response.status_code in [400, 422]


def test_batch_embed():
    texts = [
        "Fastify is a high performance web framework for Node.js",
        "React 19 brings concurrent rendering and server components",
        "Prisma ORM provides typesafe database access"
    ]
    response = client.post("/api/ai/embed/batch", json={"texts": texts})
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 3
    assert data["dimensions"] == 384
    assert len(data["embeddings"]) == 3


def test_similarity():
    response = client.post("/api/ai/similarity", json={
        "text1": "Machine learning and artificial intelligence",
        "text2": "Deep learning models and neural networks"
    })
    assert response.status_code == 200
    data = response.json()
    assert 0.0 <= data["similarity"] <= 1.0
    assert data["similarity"] > 0.5


def test_semantic_search():
    docs = [
        {"id": "doc1", "title": "Node.js Server", "content": "Fastify is a fast and low overhead web framework for Node.js"},
        {"id": "doc2", "title": "Database Engine", "content": "PostgreSQL is a powerful, open-source object-relational database system"},
        {"id": "doc3", "title": "UI Library", "content": "React is the library for web and native user interfaces"}
    ]
    response = client.post("/api/ai/semantic-search", json={
        "query": "relational SQL database and tables",
        "documents": docs,
        "top_k": 2
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) <= 2
    # doc2 should be ranked #1 for relational SQL database query
    assert data["results"][0]["id"] == "doc2"


def test_rerank():
    docs = [
        {"id": "1", "title": "Cooking", "content": "Recipe for chocolate cake with frosting"},
        {"id": "2", "title": "Redis Cache", "content": "Upstash Redis is used for high performance in-memory caching in VedEngine"}
    ]
    response = client.post("/api/ai/rerank", json={
        "query": "caching in-memory key-value data",
        "documents": docs
    })
    assert response.status_code == 200
    data = response.json()
    assert data["results"][0]["id"] == "2"


def test_chunk():
    long_text = (
        "VedEngine is an AI and vector-powered full stack search engine. "
        "It supports full-text search with tsvector and tsquery in PostgreSQL. "
        "It also integrates Upstash Redis for high speed caching. "
        "The frontend is built using React 19 and TailwindCSS. "
        "The backend is powered by Fastify 5 and Prisma ORM."
    )
    response = client.post("/api/ai/chunk", json={
        "text": long_text,
        "chunk_size": 100,
        "chunk_overlap": 20
    })
    assert response.status_code == 200
    data = response.json()
    assert data["total_chunks"] >= 2
    assert len(data["chunks"]) == data["total_chunks"]


def test_summarize():
    long_text = (
        "PostgreSQL is an advanced, enterprise-class open-source relational database that supports both SQL and JSON querying. "
        "It has a proven architecture that has earned it a strong reputation for reliability, data integrity, and correctness. "
        "VedEngine uses PostgreSQL for both full-text search and document persistence. "
        "With full-text search features like ts_rank and ts_headline, queries are processed rapidly."
    )
    response = client.post("/api/ai/summarize", json={
        "text": long_text,
        "max_sentences": 2
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["summary"]) > 0
    assert data["reduction_ratio"] <= 1.0


def test_query_expand():
    response = client.post("/api/ai/query/expand", json={
        "query": "fastify react search",
        "max_expansions": 5
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["expanded_terms"]) > 0
    assert data["original_query"] == "fastify react search"


def test_rag_answer():
    docs = [
        {
            "id": "1",
            "title": "VedEngine Architecture",
            "content": "VedEngine combines Fastify 5, React 19, PostgreSQL full-text search, and a Python AI microservice for embeddings and RAG."
        },
        {
            "id": "2",
            "title": "Cache Layer",
            "content": "Upstash Redis caches query responses for 24 hours to maximize search speed."
        }
    ]
    response = client.post("/api/ai/rag/answer", json={
        "query": "What technologies are used in VedEngine?",
        "documents": docs
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["answer"]) > 0
    assert len(data["sources"]) > 0
    assert data["confidence"] > 0.0
