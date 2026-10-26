import { describe, it, expect, beforeAll } from "vitest";
import buildApp from "../src/app.js";

describe("Analytics & SearchLog API Tests", () => {
    let app;

    beforeAll(async () => {
        app = await buildApp();
        await app.ready();
    }, 30000);

    it("should fetch search analytics metrics via GET /api/v1/analytics/search", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/analytics/search",
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toBe("success");
        expect(body.data).toBeDefined();
        expect(typeof body.data.totalSearches).toBe("number");
        expect(typeof body.data.totalDocuments).toBe("number");
    });

    it("should fetch search logs via GET /api/v1/search-log", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/search-log",
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
    });

    it("should fetch recent search logs via GET /api/v1/search-log/recent", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/search-log/recent",
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
    });

    it("should fetch trending search logs via GET /api/v1/search-log/trending", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/search-log/trending",
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
    });
});
