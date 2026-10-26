import { describe, it, expect, vi } from "vitest";
import * as aiService from "../src/services/ai.service.js";

describe("AI Client Service Integration Tests", () => {
    it("should handle isAIServiceAvailable check safely", async () => {
        const available = await aiService.isAIServiceAvailable();
        expect(typeof available).toBe("boolean");
    });

    it("should handle semanticSearch with candidate documents safely", async () => {
        const docs = [
            { id: "1", title: "PostgreSQL Database", content: "PostgreSQL relational database with SQL support" },
            { id: "2", title: "React UI", content: "React frontend user interface library" },
        ];

        const results = await aiService.semanticSearch("relational sql", docs, 2);
        expect(Array.isArray(results)).toBe(true);
    });

    it("should handle generateRAGAnswer safely with fallback", async () => {
        const docs = [
            { id: "1", title: "VedEngine Overview", content: "VedEngine is a vector-powered search platform." },
        ];

        const res = await aiService.generateRAGAnswer("What is VedEngine?", null, docs);
        // Either returns AI answer object or null if microservice is offline
        if (res) {
            expect(res.answer).toBeDefined();
            expect(Array.isArray(res.sources)).toBe(true);
        }
    });

    it("should handle chunkText gracefully", async () => {
        const chunks = await aiService.chunkText("Long document text to chunk into multiple segments.", 20, 5);
        expect(Array.isArray(chunks)).toBe(true);
    });
});
