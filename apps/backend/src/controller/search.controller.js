import { searchDocument, searchSuggestion } from "../services/search.service.js";
import { createSearchLog } from "../services/searchLog.service.js";
import { generateRAGAnswer, semanticSearch } from "../services/ai.service.js";

// Search document
// @param request - request object
// @param reply - reply object
export const searchDocumentController = async (request, reply) => {
    try {
        const startTime = Date.now();

        const {
            q,
            page = 1,
            limit = 10,
            userId = null,
            sort = "newest",
            from = null,
            to = null,
            ai = false,
        } = request.query;

        // Check for empty query
        if (!q?.trim()) {
            return reply.code(400).send({
                status: "error",
                message: "Query is required",
            });
        }

        // Check if query length is less than 2
        if (q.trim().length < 2) {
            return reply.code(400).send({
                status: "error",
                message: "Query must be atleast two characters",
            });
        }

        // Creating search log (non-blocking if it fails)
        createSearchLog(q).catch((err) => {
            console.warn("Search log creation failed (non-blocking):", err.message);
        });

        // Searching documents
        const results = await searchDocument(
            q,
            Number(page),
            Number(limit),
            userId,
            sort,
            from,
            to
        );

        let aiAnswer = null;
        let aiSources = [];
        let aiConfidence = 0;

        // If AI or RAG flag is requested, synthesize an answer
        const shouldSynthesizeAI = ai === true || ai === "true" || ai === "1";
        if (shouldSynthesizeAI && results.documents && results.documents.length > 0) {
            const ragRes = await generateRAGAnswer(q, null, results.documents);
            if (ragRes) {
                aiAnswer = ragRes.answer;
                aiSources = ragRes.sources || [];
                aiConfidence = ragRes.confidence || 0;
            }
        }

        const endTime = Date.now();
        const timeTake = endTime - startTime;

        const result = {
            status: "success",
            message: "Documents found successfully",
            query: q,
            page: results.page,
            limit: results.limit,
            total: results.total,
            totalPages: results.totalPages,
            data: results.documents,
            aiAnswer,
            aiSources,
            aiConfidence,
            timeTake,
        };

        return reply.code(200).send(result);
    } catch (error) {
        console.error("Error in searchDocumentController", error);
        return reply.code(500).send({
            status: "error",
            message: "Internal server error",
        });
    }
};

// Search suggestion
export const getSuggestions = async (request, reply) => {
    try {
        const { q } = request.query;

        if (!q?.trim()) {
            return reply.code(400).send({
                status: "error",
                message: "Query is required",
            });
        }

        const suggestions = await searchSuggestion(q);

        return reply.code(200).send({
            status: "success",
            message: "Suggestions found successfully",
            data: suggestions,
        });
    } catch (error) {
        console.error("Error in getSuggestions", error);
        return reply.code(500).send({
            status: "error",
            message: "Internal server error",
        });
    }
};

// Dedicated Semantic AI Search and RAG Controller
export const searchAIController = async (request, reply) => {
    try {
        const startTime = Date.now();
        const { q, limit = 5 } = request.query;

        if (!q?.trim()) {
            return reply.code(400).send({
                status: "error",
                message: "Query is required",
            });
        }

        if (q.trim().length < 2) {
            return reply.code(400).send({
                status: "error",
                message: "Query must be atleast two characters",
            });
        }

        // Retrieve candidates via PostgreSQL search
        const candidateResults = await searchDocument(q, 1, Number(limit) * 3);
        const candidates = candidateResults.documents || [];

        // Synthesize RAG answer using Python AI Service
        const ragResponse = await generateRAGAnswer(q, null, candidates);

        // Compute dense vector similarities to re-rank
        let rankedDocs = candidates;
        if (candidates.length > 0) {
            const semanticDocs = await semanticSearch(q, candidates, Number(limit));
            if (semanticDocs && semanticDocs.length > 0) {
                rankedDocs = semanticDocs;
            }
        }

        const endTime = Date.now();
        return reply.code(200).send({
            status: "success",
            message: "AI semantic search and RAG synthesis completed",
            query: q,
            aiAnswer: ragResponse?.answer || "No grounded AI answer could be synthesized.",
            sources: ragResponse?.sources || [],
            confidence: ragResponse?.confidence || 0,
            provider: ragResponse?.provider || "local",
            data: rankedDocs.slice(0, Number(limit)),
            timeTake: endTime - startTime,
        });
    } catch (error) {
        console.error("Error in searchAIController", error);
        return reply.code(500).send({
            status: "error",
            message: "Internal server error",
        });
    }
};

// Direct RAG Generation Controller
export const generateRAGController = async (request, reply) => {
    try {
        const { query, contexts, documents } = request.body || {};

        if (!query || !query.trim()) {
            return reply.code(400).send({
                status: "error",
                message: "Query string is required in request body",
            });
        }

        const ragResponse = await generateRAGAnswer(query, contexts, documents);

        return reply.code(200).send({
            status: "success",
            data: ragResponse,
        });
    } catch (error) {
        console.error("Error in generateRAGController", error);
        return reply.code(500).send({
            status: "error",
            message: "Internal server error",
        });
    }
};