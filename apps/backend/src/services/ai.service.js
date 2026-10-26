import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Checks whether the Python AI microservice is responsive.
 */
export async function isAIServiceAvailable() {
  try {
    const res = await aiClient.get("/health", { timeout: 2000 });
    return res.status === 200 && res.data?.status === "ok";
  } catch (error) {
    return false;
  }
}

/**
 * Generates dense vector embedding for single text.
 */
export async function generateEmbedding(text) {
  try {
    const res = await aiClient.post("/api/ai/embed", { text });
    return res.data;
  } catch (error) {
    console.warn("AI Service generateEmbedding failed:", error.message);
    return null;
  }
}

/**
 * Generates vector embeddings for a batch of texts.
 */
export async function batchEmbeddings(texts) {
  try {
    const res = await aiClient.post("/api/ai/embed/batch", { texts });
    return res.data;
  } catch (error) {
    console.warn("AI Service batchEmbeddings failed:", error.message);
    return null;
  }
}

/**
 * Computes cosine similarity between two texts.
 */
export async function computeSimilarity(text1, text2) {
  try {
    const res = await aiClient.post("/api/ai/similarity", { text1, text2 });
    return res.data;
  } catch (error) {
    console.warn("AI Service computeSimilarity failed:", error.message);
    return null;
  }
}

/**
 * Performs semantic vector search over a candidate set of documents.
 */
export async function semanticSearch(query, documents, topK = 5, threshold = 0.0) {
  try {
    const res = await aiClient.post("/api/ai/semantic-search", {
      query,
      documents: documents.map((d) => ({
        id: d.id,
        title: d.title,
        content: d.content || d.snippet || d.description || "",
        metadata: d.metadata || {},
      })),
      top_k: topK,
      threshold,
    });
    return res.data?.results || [];
  } catch (error) {
    console.warn("AI Service semanticSearch failed:", error.message);
    return [];
  }
}

/**
 * Re-ranks candidate documents using dense vector similarity against the search query.
 */
export async function rerankDocuments(query, documents, topK = null) {
  try {
    const res = await aiClient.post("/api/ai/rerank", {
      query,
      documents: documents.map((d) => ({
        id: d.id,
        title: d.title,
        content: d.content || d.snippet || d.description || "",
      })),
      top_k: topK || documents.length,
    });
    return res.data?.results || [];
  } catch (error) {
    console.warn("AI Service rerank failed:", error.message);
    return documents;
  }
}

/**
 * Generates an answer using Retrieval-Augmented Generation (RAG) over documents.
 */
export async function generateRAGAnswer(query, contexts = null, documents = null) {
  try {
    const payload = { query };
    if (contexts && contexts.length > 0) payload.contexts = contexts;
    if (documents && documents.length > 0) {
      payload.documents = documents.map((d) => ({
        id: d.id,
        title: d.title,
        content: d.content || d.snippet || d.description || "",
      }));
    }

    const res = await aiClient.post("/api/ai/rag/answer", payload, { timeout: 25000 });
    return res.data;
  } catch (error) {
    console.warn("AI Service generateRAGAnswer failed:", error.message);
    return null;
  }
}

/**
 * Chunks long text for optimal vector indexing.
 */
export async function chunkText(text, chunkSize = 500, chunkOverlap = 50) {
  try {
    const res = await aiClient.post("/api/ai/chunk", {
      text,
      chunk_size: chunkSize,
      chunk_overlap: chunkOverlap,
    });
    return res.data?.chunks || [];
  } catch (error) {
    console.warn("AI Service chunkText failed:", error.message);
    return [];
  }
}

/**
 * Generates extractive summary for text.
 */
export async function summarizeText(text, maxSentences = 3) {
  try {
    const res = await aiClient.post("/api/ai/summarize", {
      text,
      max_sentences: maxSentences,
    });
    return res.data;
  } catch (error) {
    console.warn("AI Service summarizeText failed:", error.message);
    return null;
  }
}

/**
 * Expands search query with synonyms and conceptual keywords.
 */
export async function expandQuery(query) {
  try {
    const res = await aiClient.post("/api/ai/query/expand", { query });
    return res.data;
  } catch (error) {
    console.warn("AI Service expandQuery failed:", error.message);
    return null;
  }
}
