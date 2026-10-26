import re
import logging
from typing import Any, Dict, List, Optional, Tuple
import httpx
import numpy as np

from app.config import settings
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)


class RAGService:
    def __init__(self):
        pass

    def chunk_text(
        self,
        text: str,
        chunk_size: int = 500,
        chunk_overlap: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Chunks long text into overlapping segments respecting sentence and paragraph boundaries.
        """
        if not text or not text.strip():
            return []

        cleaned = text.strip()
        if len(cleaned) <= chunk_size:
            return [{
                "chunk_index": 0,
                "text": cleaned,
                "start_char": 0,
                "end_char": len(cleaned),
                "char_count": len(cleaned)
            }]

        # Split text into natural sentence or paragraph units
        sentence_delimiters = re.compile(r'(?<=[.!?\n])\s+')
        sentences = [s.strip() for s in sentence_delimiters.split(cleaned) if s.strip()]

        chunks = []
        current_chunk_sentences = []
        current_length = 0
        current_start = 0

        for sentence in sentences:
            sentence_len = len(sentence)
            if current_length + sentence_len + 1 > chunk_size and current_chunk_sentences:
                chunk_str = " ".join(current_chunk_sentences)
                end_pos = current_start + len(chunk_str)
                chunks.append({
                    "chunk_index": len(chunks),
                    "text": chunk_str,
                    "start_char": current_start,
                    "end_char": end_pos,
                    "char_count": len(chunk_str)
                })

                # Calculate overlap by retaining trailing sentences
                overlap_sentences = []
                overlap_len = 0
                for prev_s in reversed(current_chunk_sentences):
                    if overlap_len + len(prev_s) <= chunk_overlap:
                        overlap_sentences.insert(0, prev_s)
                        overlap_len += len(prev_s) + 1
                    else:
                        break

                current_chunk_sentences = list(overlap_sentences)
                current_length = sum(len(s) + 1 for s in current_chunk_sentences)
                current_start = max(0, end_pos - current_length)

            current_chunk_sentences.append(sentence)
            current_length += sentence_len + 1

        if current_chunk_sentences:
            chunk_str = " ".join(current_chunk_sentences)
            chunks.append({
                "chunk_index": len(chunks),
                "text": chunk_str,
                "start_char": current_start,
                "end_char": current_start + len(chunk_str),
                "char_count": len(chunk_str)
            })

        return chunks

    def summarize_text(self, text: str, max_sentences: int = 3) -> Dict[str, Any]:
        """
        Generates an extractive summary of text by scoring sentence embeddings
        against the global document centroid vector.
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty.")

        cleaned = text.strip()
        sentence_delimiters = re.compile(r'(?<=[.!?\n])\s+')
        sentences = [s.strip() for s in sentence_delimiters.split(cleaned) if len(s.strip()) > 15]

        if len(sentences) <= max_sentences:
            return {
                "summary": cleaned,
                "original_length": len(cleaned),
                "summary_length": len(cleaned),
                "reduction_ratio": 1.0
            }

        # Embed all sentences
        sentence_embeddings = np.array(embedding_service.generate_embeddings(sentences), dtype=np.float32)

        # Compute document centroid vector
        doc_centroid = np.mean(sentence_embeddings, axis=0)
        norm = np.linalg.norm(doc_centroid)
        if norm > 0:
            doc_centroid = doc_centroid / norm

        # Score sentences against document centroid
        scores = np.dot(sentence_embeddings, doc_centroid)

        # Select top-k sentences with highest relevance
        top_indices = np.argsort(scores)[::-1][:max_sentences]
        # Sort indices back to original reading order
        top_indices = sorted(top_indices.tolist())

        selected_sentences = [sentences[i] for i in top_indices]
        summary_text = " ".join(selected_sentences)

        return {
            "summary": summary_text,
            "original_length": len(cleaned),
            "summary_length": len(summary_text),
            "reduction_ratio": round(len(summary_text) / len(cleaned), 3)
        }

    def expand_query(self, query: str, max_expansions: int = 5) -> Dict[str, Any]:
        """
        Enriches a search query with conceptual keywords and technical synonyms.
        """
        if not query or not query.strip():
            raise ValueError("Query cannot be empty.")

        cleaned_query = query.strip()
        tokens = re.findall(r'\b[a-zA-Z0-9_\-]+\b', cleaned_query.lower())

        # Domain term association map for search engine technical queries
        concept_graph = {
            "fastify": ["node.js", "http server", "rest api", "plugins", "microservices"],
            "react": ["ui components", "frontend", "hooks", "virtual dom", "state management"],
            "prisma": ["orm", "postgresql", "schema migration", "database query", "sql"],
            "redis": ["in-memory cache", "upstash", "key-value store", "pub-sub", "ttl"],
            "search": ["full-text indexing", "tsvector", "vector ranking", "bm25", "semantic search"],
            "vector": ["embeddings", "cosine similarity", "nearest neighbor", "dimension", "dense retrieval"],
            "ai": ["machine learning", "neural networks", "rag", "language models", "inference"],
            "rag": ["retrieval augmented generation", "vector search", "knowledge base", "grounded synthesis"],
            "database": ["relational schema", "postgresql", "indexing", "acid transactions", "sql query"],
            "auth": ["jwt", "bearer token", "rbac", "security", "sessions"],
            "api": ["rest endpoints", "json", "http status codes", "crud", "request handler"],
            "python": ["fastapi", "sentence-transformers", "torch", "asyncio", "pydantic"],
            "docker": ["containers", "dockerfile", "images", "deployment", "orchestration"]
        }

        expanded_terms = set()
        for token in tokens:
            if token in concept_graph:
                for term in concept_graph[token]:
                    expanded_terms.add(term)

        # General expansion terms if no exact match in dictionary
        if not expanded_terms:
            expanded_terms.update([f"{cleaned_query} overview", f"{cleaned_query} documentation", f"{cleaned_query} guide"])

        selected_expansions = list(expanded_terms)[:max_expansions]
        enhanced_query = f"{cleaned_query} " + " ".join(selected_expansions)

        return {
            "original_query": cleaned_query,
            "expanded_terms": selected_expansions,
            "enhanced_query": enhanced_query.strip()
        }

    async def generate_rag_answer(
        self,
        query: str,
        contexts: Optional[List[str]] = None,
        documents: Optional[List[Any]] = None,
        system_prompt: Optional[str] = None,
        max_tokens: int = 512
    ) -> Dict[str, Any]:
        """
        Executes Retrieval-Augmented Generation (RAG):
        1. Assembles and semantically ranks relevant passages.
        2. Routes to configured LLM (OpenAI / Ollama) or falls back to robust local synthesis.
        """
        if not query or not query.strip():
            raise ValueError("Query cannot be empty.")

        # Consolidate candidate context snippets
        assembled_candidates: List[Tuple[Optional[str], str]] = []

        if contexts:
            for ctx in contexts:
                if ctx and ctx.strip():
                    assembled_candidates.append((None, ctx.strip()))

        if documents:
            for doc in documents:
                if isinstance(doc, dict):
                    title = doc.get("title")
                    content = doc.get("content", "")
                else:
                    title = getattr(doc, "title", None)
                    content = getattr(doc, "content", "")

                if content and content.strip():
                    assembled_candidates.append((title, content.strip()))

        if not assembled_candidates:
            return {
                "query": query,
                "answer": "No relevant context or reference documents were provided to formulate an answer.",
                "sources": [],
                "confidence": 0.0,
                "provider": "none"
            }

        # Rank candidates against the query using embedding semantic search
        doc_structures = [{"title": t, "content": c} for t, c in assembled_candidates]
        scored_docs = embedding_service.semantic_search(query, doc_structures, top_k=min(5, len(doc_structures)))

        sources = []
        for i, sd in enumerate(scored_docs):
            snippet = sd["content"]
            if len(snippet) > 250:
                snippet = snippet[:250].rsplit(" ", 1)[0] + "..."
            sources.append({
                "index": i + 1,
                "title": sd["title"] or f"Context Source {i + 1}",
                "snippet": snippet,
                "relevance_score": sd["score"]
            })

        top_score = scored_docs[0]["score"] if scored_docs else 0.0

        # Try external LLM if configured
        if settings.LLM_PROVIDER == "groq" and settings.GROQ_API_KEY:
            try:
                answer = await self._call_groq_llm(query, scored_docs, system_prompt, max_tokens)
                return {
                    "query": query,
                    "answer": answer,
                    "sources": sources,
                    "confidence": round(float(top_score), 4),
                    "provider": f"groq/{settings.GROQ_MODEL}"
                }
            except Exception as e:
                logger.warning(f"Groq LLM call failed: {e}. Falling back to local synthesis engine.")

        elif settings.LLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
            try:
                answer = await self._call_openai_llm(query, scored_docs, system_prompt, max_tokens)
                return {
                    "query": query,
                    "answer": answer,
                    "sources": sources,
                    "confidence": round(float(top_score), 4),
                    "provider": f"openai/{settings.OPENAI_MODEL}"
                }
            except Exception as e:
                logger.warning(f"OpenAI LLM call failed: {e}. Falling back to local synthesis engine.")

        elif settings.LLM_PROVIDER == "ollama":
            try:
                answer = await self._call_ollama_llm(query, scored_docs, system_prompt, max_tokens)
                return {
                    "query": query,
                    "answer": answer,
                    "sources": sources,
                    "confidence": round(float(top_score), 4),
                    "provider": f"ollama/{settings.OLLAMA_MODEL}"
                }
            except Exception as e:
                logger.warning(f"Ollama LLM call failed: {e}. Falling back to local synthesis engine.")

        # Local Synthesis Engine (Default / Fallback)
        answer = self._synthesize_local_answer(query, scored_docs)
        return {
            "query": query,
            "answer": answer,
            "sources": sources,
            "confidence": round(float(top_score), 4),
            "provider": "vedengine-local-rag"
        }

    def _synthesize_local_answer(self, query: str, scored_docs: List[Dict[str, Any]]) -> str:
        """
        Synthesizes an intelligent, structured search answer with citations from top-ranked passages.
        """
        if not scored_docs:
            return "Unable to find specific answers matching the query in the provided documents."

        # Collect top informative sentences from top scored documents
        query_words = set(re.findall(r'\b[a-zA-Z0-9]+\b', query.lower()))
        answer_bullets = []

        for idx, doc in enumerate(scored_docs[:3]):
            content = doc.get("content", "")
            title = doc.get("title") or f"Source {idx + 1}"
            sentence_delimiters = re.compile(r'(?<=[.!?\n])\s+')
            sentences = [s.strip() for s in sentence_delimiters.split(content) if len(s.strip()) > 20]

            # Find sentence with highest overlap or keyword match to query
            best_sentence = None
            best_overlap = -1

            for s in sentences:
                s_words = set(re.findall(r'\b[a-zA-Z0-9]+\b', s.lower()))
                overlap = len(query_words.intersection(s_words))
                if overlap > best_overlap:
                    best_overlap = overlap
                    best_sentence = s

            if best_sentence:
                answer_bullets.append(f"- **{title}**: {best_sentence} `[{idx + 1}]`")

        if not answer_bullets:
            # Fallback to the first chunk of the highest scoring doc
            best_doc = scored_docs[0]
            first_sentence = best_doc.get("content", "").split(".")[0]
            answer_bullets.append(f"- {first_sentence}. `[1]`")

        bullets_formatted = "\n".join(answer_bullets)
        top_title = scored_docs[0].get("title") or "the available knowledge base"
        response_text = (
            f"Based on {top_title} and indexed sources, here is the synthesis for your query:\n\n"
            f"{bullets_formatted}\n\n"
            f"> *Sources are cited above with bracket references corresponding to the verified documents.*"
        )
        return response_text

    async def _call_groq_llm(
        self,
        query: str,
        scored_docs: List[Dict[str, Any]],
        custom_system: Optional[str],
        max_tokens: int
    ) -> str:
        """Calls Groq Chat Completions API with high-throughput LLaMA models."""
        context_text = "\n\n".join([
            f"[{i + 1}] Title: {d.get('title', 'Unknown')}\nContent: {d.get('content', '')}"
            for i, d in enumerate(scored_docs)
        ])

        system_message = custom_system or (
            "You are VedEngine AI, a high-performance search intelligence assistant powered by Groq. "
            "Synthesize a clear, accurate, and comprehensive answer to the user query using only the provided context. "
            "Cite sources precisely using [1], [2], etc. Keep formatting clean, authoritative, and direct."
        )

        user_content = f"Query: {query}\n\nRetrieved Context:\n{context_text}"

        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": settings.GROQ_MODEL,
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_content}
            ],
            "max_tokens": max_tokens,
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{settings.GROQ_BASE_URL.rstrip('/')}/chat/completions",
                headers=headers,
                json=payload
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()

    async def _call_openai_llm(
        self,
        query: str,
        scored_docs: List[Dict[str, Any]],
        custom_system: Optional[str],
        max_tokens: int
    ) -> str:
        """Calls OpenAI-compatible Chat Completions API."""
        context_text = "\n\n".join([
            f"[{i + 1}] Title: {d.get('title', 'Unknown')}\nContent: {d.get('content', '')}"
            for i, d in enumerate(scored_docs)
        ])

        system_message = custom_system or (
            "You are VedEngine AI, an accurate search and RAG synthesis assistant. "
            "Answer the user query accurately and comprehensively using only the provided context. "
            "Cite sources using [1], [2], etc."
        )

        user_content = f"Query: {query}\n\nRetrieved Context:\n{context_text}"

        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": settings.OPENAI_MODEL,
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_content}
            ],
            "max_tokens": max_tokens,
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{settings.OPENAI_BASE_URL.rstrip('/')}/chat/completions",
                headers=headers,
                json=payload
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()

    async def _call_ollama_llm(
        self,
        query: str,
        scored_docs: List[Dict[str, Any]],
        custom_system: Optional[str],
        max_tokens: int
    ) -> str:
        """Calls local Ollama API."""
        context_text = "\n\n".join([
            f"[{i + 1}] Title: {d.get('title', 'Unknown')}\nContent: {d.get('content', '')}"
            for i, d in enumerate(scored_docs)
        ])

        prompt = (
            f"Context:\n{context_text}\n\n"
            f"Query: {query}\n\n"
            f"Answer the query based on the context above. Cite sources with [1], [2] brackets:"
        )

        payload = {
            "model": settings.OLLAMA_MODEL,
            "prompt": prompt,
            "system": custom_system or "You are VedEngine AI assistant.",
            "stream": False
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(
                f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate",
                json=payload
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", "").strip()


rag_service = RAGService()
