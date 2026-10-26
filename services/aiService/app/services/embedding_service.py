import logging
from typing import Any, Dict, List, Optional, Union
import numpy as np
from sentence_transformers import SentenceTransformer

from app.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    def __init__(self, model_name: Optional[str] = None, device: Optional[str] = None):
        self.model_name = model_name or settings.EMBEDDING_MODEL_NAME
        self.device = device or settings.DEVICE
        self._model: Optional[SentenceTransformer] = None

    @property
    def model(self) -> SentenceTransformer:
        """Lazy loads the model when first accessed to optimize startup time."""
        if self._model is None:
            logger.info(f"Loading embedding model: {self.model_name} on device: {self.device}")
            self._model = SentenceTransformer(self.model_name, device=self.device)
            if hasattr(self._model, "max_seq_length"):
                self._model.max_seq_length = settings.MAX_SEQUENCE_LENGTH
        return self._model

    def get_dimension(self) -> int:
        """Returns the dimensionality of the embeddings."""
        return self.model.get_sentence_embedding_dimension()

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates a normalized dense vector embedding for a single text string.
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty or whitespace only.")

        cleaned_text = text.strip()
        embedding = self.model.encode(
            cleaned_text,
            normalize_embeddings=settings.NORMALIZE_EMBEDDINGS,
            show_progress_bar=False,
            convert_to_numpy=True
        )

        return embedding.tolist()

    def generate_embeddings(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """
        Generates vector embeddings for a batch of text strings.
        """
        if not texts:
            raise ValueError("Texts list cannot be empty.")

        cleaned_texts = [t.strip() for t in texts]
        if any(len(t) == 0 for t in cleaned_texts):
            raise ValueError("Texts list contains empty or whitespace-only elements.")

        embeddings = self.model.encode(
            cleaned_texts,
            batch_size=batch_size,
            normalize_embeddings=settings.NORMALIZE_EMBEDDINGS,
            show_progress_bar=False,
            convert_to_numpy=True
        )

        return embeddings.tolist()

    def compute_similarity(self, text1: str, text2: str) -> float:
        """
        Computes cosine similarity between two text strings.
        """
        emb1 = np.array(self.generate_embedding(text1), dtype=np.float32)
        emb2 = np.array(self.generate_embedding(text2), dtype=np.float32)

        # Since embeddings are normalized, cosine similarity is simply the dot product
        similarity = float(np.dot(emb1, emb2))
        return max(0.0, min(1.0, similarity))

    def semantic_search(
        self,
        query: str,
        documents: List[Union[Dict[str, Any], Any]],
        top_k: int = 5,
        threshold: float = 0.0
    ) -> List[Dict[str, Any]]:
        """
        Performs vector semantic search by scoring a query vector against candidate documents.
        """
        if not query or not query.strip():
            raise ValueError("Query cannot be empty.")
        if not documents:
            return []

        # Prepare text representation for each document
        doc_texts = []
        for doc in documents:
            if isinstance(doc, dict):
                title = doc.get("title", "") or ""
                content = doc.get("content", "") or ""
            else:
                title = getattr(doc, "title", "") or ""
                content = getattr(doc, "content", "") or ""

            # Combine title and content to provide rich semantic context
            combined = f"{title}. {content}".strip() if title else content.strip()
            if not combined:
                combined = "Untitled empty document"
            doc_texts.append(combined)

        query_vec = np.array(self.generate_embedding(query), dtype=np.float32)
        doc_vecs = np.array(self.generate_embeddings(doc_texts), dtype=np.float32)

        # Compute cosine similarities via matrix-vector multiplication
        scores = np.dot(doc_vecs, query_vec)

        results = []
        for idx, score in enumerate(scores):
            score_val = float(score)
            if score_val >= threshold:
                doc = documents[idx]
                if isinstance(doc, dict):
                    doc_id = doc.get("id")
                    title = doc.get("title")
                    content = doc.get("content", "")
                    metadata = doc.get("metadata", {})
                else:
                    doc_id = getattr(doc, "id", None)
                    title = getattr(doc, "title", None)
                    content = getattr(doc, "content", "")
                    metadata = getattr(doc, "metadata", {})

                results.append({
                    "id": doc_id,
                    "title": title,
                    "content": content,
                    "score": round(score_val, 4),
                    "metadata": metadata
                })

        # Sort descending by relevance score
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def rerank(
        self,
        query: str,
        documents: List[Union[Dict[str, Any], Any]],
        top_k: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Re-ranks a list of search documents against a user query using dense vector similarities.
        """
        return self.semantic_search(
            query=query,
            documents=documents,
            top_k=top_k if top_k is not None else len(documents),
            threshold=0.0
        )


embedding_service = EmbeddingService()