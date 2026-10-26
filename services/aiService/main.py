import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api.routes import router
from app.config import settings

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("vedengine-ai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-warms service components and logs startup information."""
    logger.info(f"Starting {settings.SERVICE_NAME} v{settings.VERSION}")
    logger.info(f"Target device: {settings.DEVICE}")
    logger.info(f"Embedding model: {settings.EMBEDDING_MODEL_NAME}")
    logger.info(f"LLM Provider: {settings.LLM_PROVIDER}")
    yield
    logger.info(f"Shutting down {settings.SERVICE_NAME}")


app = FastAPI(
    title=settings.SERVICE_NAME,
    version=settings.VERSION,
    description="Vector embedding, semantic search, re-ranking, and RAG service for VedEngine search platform.",
    lifespan=lifespan
)

# Enable CORS for frontend and backend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/", tags=["General"])
def root():
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "endpoints": {
            "health": "/health",
            "info": "/api/ai/info",
            "embed": "/api/ai/embed",
            "batch_embed": "/api/ai/embed/batch",
            "similarity": "/api/ai/similarity",
            "semantic_search": "/api/ai/semantic-search",
            "rerank": "/api/ai/rerank",
            "rag_answer": "/api/ai/rag/answer",
            "chunk": "/api/ai/chunk",
            "summarize": "/api/ai/summarize",
            "query_expand": "/api/ai/query/expand"
        }
    }


@app.get("/health", tags=["General"])
def health_check():
    return {
        "status": "ok",
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "device": settings.DEVICE
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )