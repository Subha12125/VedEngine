import os
from typing import List, Optional
import torch
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Service Information
    SERVICE_NAME: str = "VedEngine AI Service"
    VERSION: str = "1.0.0"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False

    # Embedding Settings
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384
    DEVICE: str = "cuda" if torch.cuda.is_available() else "cpu"
    NORMALIZE_EMBEDDINGS: bool = True
    MAX_SEQUENCE_LENGTH: int = 512

    # LLM & RAG Provider Settings
    LLM_PROVIDER: str = "groq"  # "groq", "openai", "ollama", "local"
    GROQ_API_KEY: Optional[str] = None
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_MODEL: str = "qwen/qwen3.8-27b"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    OPENAI_MODEL: str = "gpt-4o-mini"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"

    # Search & Ranking Defaults
    DEFAULT_TOP_K: int = 5
    SIMILARITY_THRESHOLD: float = 0.25

    # CORS Settings
    CORS_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
