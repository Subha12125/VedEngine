from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# --- Embedding Schemas ---

class EmbeddingRequest(BaseModel):
    text: str = Field(..., min_length=1, title="Text", description="Text to be embedded")


class EmbeddingResponse(BaseModel):
    embedding: List[float] = Field(..., title="Embedding", description="Generated vector embedding")
    dimensions: int = Field(..., title="Dimensions", description="Dimensionality of the embedding vector")


class BatchEmbeddingRequest(BaseModel):
    texts: List[str] = Field(..., min_items=1, title="Texts", description="List of texts to embed in batch")


class BatchEmbeddingResponse(BaseModel):
    embeddings: List[List[float]] = Field(..., title="Embeddings", description="List of generated vector embeddings")
    count: int = Field(..., title="Count", description="Number of embeddings generated")
    dimensions: int = Field(..., title="Dimensions", description="Embedding dimensionality")


# --- Similarity Schemas ---

class SimilarityRequest(BaseModel):
    text1: str = Field(..., min_length=1, description="First text snippet")
    text2: str = Field(..., min_length=1, description="Second text snippet")


class SimilarityResponse(BaseModel):
    similarity: float = Field(..., description="Cosine similarity score between 0.0 and 1.0")
    interpretation: str = Field(..., description="Human-readable similarity description")


# --- Document & Search Schemas ---

class DocumentItem(BaseModel):
    id: Optional[str] = Field(None, description="Unique document ID or URL")
    title: Optional[str] = Field(None, description="Document title")
    content: str = Field(..., min_length=1, description="Text content of the document")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Custom metadata key-values")


class ScoredDocument(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = None
    content: str
    score: float = Field(..., description="Relevance score (cosine similarity)")
    metadata: Optional[Dict[str, Any]] = None


class SemanticSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="User search query")
    documents: List[DocumentItem] = Field(..., min_items=1, description="Candidate documents to rank")
    top_k: int = Field(5, ge=1, le=100, description="Maximum number of top results to return")
    threshold: float = Field(0.0, ge=0.0, le=1.0, description="Minimum similarity threshold")


class SemanticSearchResponse(BaseModel):
    query: str
    results: List[ScoredDocument]
    total_matched: int


class ReRankRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Search query")
    documents: List[DocumentItem] = Field(..., min_items=1, description="Documents to re-rank")
    top_k: Optional[int] = Field(None, ge=1, description="Optional cap on re-ranked results")


class ReRankResponse(BaseModel):
    query: str
    results: List[ScoredDocument]


# --- RAG (Retrieval-Augmented Generation) Schemas ---

class RAGRequest(BaseModel):
    query: str = Field(..., min_length=1, description="User question or query")
    contexts: Optional[List[str]] = Field(None, description="List of raw text contexts")
    documents: Optional[List[DocumentItem]] = Field(None, description="Structured document contexts")
    system_prompt: Optional[str] = Field(None, description="Optional custom system prompt")
    max_tokens: Optional[int] = Field(512, ge=64, le=2048, description="Maximum response length")


class RAGSource(BaseModel):
    index: int
    title: Optional[str] = None
    snippet: str
    relevance_score: float


class RAGResponse(BaseModel):
    query: str
    answer: str
    sources: List[RAGSource]
    confidence: float
    provider: str


# --- Chunking Schemas ---

class ChunkRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Raw document text to chunk")
    chunk_size: int = Field(500, ge=50, le=4000, description="Target character size per chunk")
    chunk_overlap: int = Field(50, ge=0, le=1000, description="Overlap characters between adjacent chunks")


class ChunkItem(BaseModel):
    chunk_index: int
    text: str
    start_char: int
    end_char: int
    char_count: int


class ChunkResponse(BaseModel):
    chunks: List[ChunkItem]
    total_chunks: int


# --- Summarization & Query Expansion Schemas ---

class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to summarize")
    max_sentences: int = Field(3, ge=1, le=10, description="Maximum number of sentences in summary")


class SummarizeResponse(BaseModel):
    summary: str
    original_length: int
    summary_length: int
    reduction_ratio: float


class QueryExpansionRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Search query to expand")
    max_expansions: int = Field(5, ge=1, le=15, description="Max expansion terms")


class QueryExpansionResponse(BaseModel):
    original_query: str
    expanded_terms: List[str]
    enhanced_query: str


# --- System Info Schemas ---

class ServiceInfoResponse(BaseModel):
    service: str
    version: str
    embedding_model: str
    embedding_dimension: int
    device: str
    llm_provider: str
    capabilities: List[str]