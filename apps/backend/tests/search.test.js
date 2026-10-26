import { describe, it, expect, beforeAll, vi } from "vitest";
import buildApp from "../src/app.js";

// Mock Redis for search route tests so they do not block on remote network timeouts
vi.mock("../src/config/redis.config.js", () => ({
    redis: {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue("OK"),
        scan: vi.fn().mockResolvedValue([0, []]),
        del: vi.fn().mockResolvedValue(0),
    },
}));

describe("Search API Tests — /api/v1/search", () => {
    let app;

    beforeAll(async () => {
        app = await buildApp();
        await app.ready();
    }, 30000);

    describe("GET /api/v1/search", () => {
        it("should return 400 if query is missing", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/search",
            });

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.status).toBe("error");
        });

        it("should return 400 if query is shorter than 2 characters", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/search?q=a",
            });

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.status).toBe("error");
            expect(body.message).toContain("atleast two characters");
        });

        it("should execute full-text search with valid query", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/search?q=machine",
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.status).toBe("success");
            expect(body.query).toBe("machine");
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.page).toBe(1);
            expect(body.limit).toBe(10);
            expect(typeof body.timeTake).toBe("number");
        });

        it("should support pagination parameters (page and limit)", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/search?q=learning&page=2&limit=5",
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.status).toBe("success");
            expect(body.page).toBe(2);
            expect(body.limit).toBe(5);
        });

        it("should support sorting by newest and oldest", async () => {
            const resNewest = await app.inject({
                method: "GET",
                url: "/api/v1/search?q=database&sort=newest",
            });
            expect(resNewest.statusCode).toBe(200);

            const resOldest = await app.inject({
                method: "GET",
                url: "/api/v1/search?q=database&sort=oldest",
            });
            expect(resOldest.statusCode).toBe(200);
        });

        it("should gracefully handle date range filters (from, to)", async () => {
            const from = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
            const to = new Date().toISOString();
            const response = await app.inject({
                method: "GET",
                url: `/api/v1/search?q=data&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.status).toBe("success");
        });
    });

    describe("GET /api/v1/search/suggestions", () => {
        it("should reject empty suggestion queries with 400", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/search/suggestions",
            });

            expect(response.statusCode).toBe(400);
        });

        it("should return matching suggestions for a valid query", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/search/suggestions?q=data",
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.status).toBe("success");
            expect(Array.isArray(body.data)).toBe(true);
        });
    });

    describe("GET /api/v1/search/ai", () => {
        it("should reject missing query with 400", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/search/ai",
            });

            expect(response.statusCode).toBe(400);
        });

        it("should perform AI search and return structured RAG payload", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/v1/search/ai?q=database&limit=3",
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.status).toBe("success");
            expect(body.query).toBe("database");
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.aiAnswer).toBeDefined();
        });
    });
});
