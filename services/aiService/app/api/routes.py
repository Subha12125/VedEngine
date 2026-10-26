import logging
from fastapi import APIRouter, HTTPException, status

from app.config import settings
from app.models.schemas import (
    BatchEmbeddingRequest,
    BatchEmbeddingResponse,
    ChunkRequest,
    ChunkResponse,
    EmbeddingRequest,
    EmbeddingResponse,
    QueryExpansionRequest,
    QueryExpansionResponse,
    RAGRequest,
    RAGResponse,
    ReRankRequest,
    ReRankResponse,
    ScoredDocument,
    SemanticSearchRequest,
    SemanticSearchResponse,
    ServiceInfoResponse,
    SimilarityRequest,
    SimilarityResponse,
    SummarizeRequest,
    SummarizeResponse,
)
from app.services.embedding_service import embedding_service
from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["AI Engine"])


@router.get("/info", response_model=ServiceInfoResponse)
def get_service_info():
    """
    Returns AI service specifications, active model, dimension, and supported capabilities.
    """
    return ServiceInfoResponse(
        service=settings.SERVICE_NAME,
        version=settings.VERSION,
        embedding_model=settings.EMBEDDING_MODEL_NAME,
        embedding_dimension=settings.EMBEDDING_DIMENSION,
        device=settings.DEVICE,
        llm_provider=settings.LLM_PROVIDER,
        capabilities=[
            "single_embedding",
            "batch_embedding",
            "cosine_similarity",
            "semantic_vector_search",
            "search_reranking",
            "rag_answer_synthesis",
            "document_chunking",
            "extractive_summarization",
            "query_expansion"
        ]
    )


@router.post("/embed", response_model=EmbeddingResponse)
def generate_embedding(request: EmbeddingRequest):
    """
    Generates a dense normalized vector embedding for a single text string.
    """
    try:
        embedding = embedding_service.generate_embedding(request.text)
        return EmbeddingResponse(
            embedding=embedding,
            dimensions=len(embedding)
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
    except Exception as error:
        logger.error(f"Embedding generation error: {error}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Embedding generation failed: {str(error)}"
        )


@router.post("/embed/batch", response_model=BatchEmbeddingResponse)
def generate_batch_embeddings(request: BatchEmbeddingRequest):
    """
    Generates vector embeddings for a batch of text strings efficiently.
    """
    try:
        embeddings = embedding_service.generate_embeddings(request.texts)
        count = len(embeddings)
        dims = len(embeddings[0]) if count > 0 else 0

        return BatchEmbeddingResponse(
            embeddings=embeddings,
            count=count,
            dimensions=dims
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
    except Exception as error:
        logger.error(f"Batch embedding generation error: {error}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch embedding generation failed: {str(error)}"
        )


@router.post("/similarity", response_model=SimilarityResponse)
def compute_similarity(request: SimilarityRequest):
    """
    Computes semantic cosine similarity between two text snippets.
    """
    try:
        sim = embedding_service.compute_similarity(request.text1, request.text2)
        if sim > 0.8:
            interp = "Very High Semantic Similarity"
        elif sim > 0.6:
            interp = "High Semantic Similarity"
        elif sim > 0.4:
            interp = "Moderate Semantic Similarity"
        else:
            interp = "Low / Distant Semantic Similarity"

        return SimilarityResponse(
            similarity=round(sim, 4),
            interpretation=interp
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
    except Exception as error:
        logger.error(f"Similarity computation error: {error}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Similarity computation failed: {str(error)}"
        )


@router.post("/semantic-search", response_model=SemanticSearchResponse)
def semantic_search(request: SemanticSearchRequest):
    """
    Executes dense vector search, scoring candidate documents against the query.
    """
    try:
        results = embedding_service.semantic_search(
            query=request.query,
            documents=request.documents,
            top_k=request.top_k,
            threshold=request.threshold
        )
        scored_docs = [ScoredDocument(**r) for r in results]

        return SemanticSearchResponse(
            query=request.query,
            results=scored_docs,
            total_matched=len(scored_docs)
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
    except Exception as error:
        logger.error(f"Semantic search error: {error}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Semantic search failed: {str(error)}"
        )


@router.post("/rerank", response_model=ReRankResponse)
def rerank_documents(request: ReRankRequest):
    """
    Re-ranks search results using semantic similarity scoring against the query.
    """
    try:
        results = embedding_service.rerank(
            query=request.query,
            documents=request.documents,
            top_k=request.top_k
        )
        scored_docs = [ScoredDocument(**r) for r in results]

        return ReRankResponse(
            query=request.query,
            results=scored_docs
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
    except Exception as error:
        logger.error(f"Rerank error: {error}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document re-ranking failed: {str(error)}"
        )


@router.post("/rag/answer", response_model=RAGResponse)
async def generate_rag_answer(request: RAGRequest):
    """
    Generates an answer using Retrieval-Augmented Generation (RAG) over supplied contexts/documents.
    """
    try:
        result = await rag_service.generate_rag_answer(
            query=request.query,
            contexts=request.contexts,
            documents=request.documents,
            system_prompt=request.system_prompt,
            max_tokens=request.max_tokens or 512
        )
        return RAGResponse(**result)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
    except Exception as error:
        logger.error(f"RAG answer error: {error}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG answer generation failed: {str(error)}"
        )


@router.post("/chunk", response_model=ChunkResponse)
def chunk_document(request: ChunkRequest):
    """
    Splits long document text into overlapping chunks for indexing.
    """
    try:
        chunks = rag_service.chunk_text(
            text=request.text,
            chunk_size=request.chunk_size,
            chunk_overlap=request.chunk_overlap
        )
        return ChunkResponse(
            chunks=chunks,
            total_chunks=len(chunks)
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
    except Exception as error:
        logger.error(f"Chunking error: {error}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text chunking failed: {str(error)}"
        )


@router.post("/summarize", response_model=SummarizeResponse)
def summarize_text(request: SummarizeRequest):
    """
    Generates an extractive summary of text using semantic sentence scoring.
    """
    try:
        res = rag_service.summarize_text(
            text=request.text,
            max_sentences=request.max_sentences
        )
        return SummarizeResponse(**res)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
    except Exception as error:
        logger.error(f"Summarization error: {error}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Summarization failed: {str(error)}"
        )


@router.post("/query/expand", response_model=QueryExpansionResponse)
def expand_query(request: QueryExpansionRequest):
    """
    Expands a user query with technical keywords and synonyms.
    """
    try:
        res = rag_service.expand_query(
            query=request.query,
            max_expansions=request.max_expansions
        )
        return QueryExpansionResponse(**res)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
    except Exception as error:
        logger.error(f"Query expansion error: {error}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query expansion failed: {str(error)}"
        )