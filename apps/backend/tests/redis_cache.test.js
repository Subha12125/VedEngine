import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchDocument } from "../src/services/search.service.js";
import { invalidateSearchCache } from "../src/services/cache.service.js";
import { redis } from "../src/config/redis.config.js";

const mockStore = new Map();

vi.mock("../src/config/redis.config.js", () => ({
    redis: {
        get: vi.fn(async (key) => (mockStore.has(key) ? mockStore.get(key) : null)),
        set: vi.fn(async (key, val) => {
            mockStore.set(key, val);
            return "OK";
        }),
        scan: vi.fn(async (_cursor, opts) => {
            const pattern = opts?.match || "*";
            const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`);
            const matchedKeys = Array.from(mockStore.keys()).filter((k) => regex.test(k));
            return [0, matchedKeys];
        }),
        del: vi.fn(async (...keys) => {
            let count = 0;
            for (const k of keys) {
                if (mockStore.delete(k)) count++;
            }
            return count;
        }),
    },
}));

vi.mock("../src/config/prisma.config.js", () => ({
    default: {
        $queryRaw: vi.fn(async () => [
            {
                id: "doc-1",
                title: "Machine Learning Primer",
                description: "Introduction to ML",
                content: "Content about machine learning",
                url: null,
                fileType: "text/plain",
                fileName: "ml.txt",
                fileUrl: "./uploads/ml.txt",
                snippet: "Snippet for <mark>machine</mark> learning",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                rank: 0.95,
                total: 1,
            },
        ]),
        document: {
            findMany: vi.fn(async () => [
                {
                    id: "doc-1",
                    title: "Machine Learning Primer",
                    description: "Introduction to ML",
                    content: "Content about machine learning",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ]),
            count: vi.fn(async () => 1),
        },
    },
    Prisma: {
        sql: (strings, ...values) => ({ strings, values }),
        empty: "",
        join: (arr) => arr,
    },
}));

describe("Redis Cache Integration & Resilience Tests", () => {
    beforeEach(() => {
        mockStore.clear();
    });

    it("1. Cache miss followed by cache population: populates cache on initial search", async () => {
        expect(mockStore.size).toBe(0);

        const result = await searchDocument("machine learning", 1, 10, null, "newest");
        expect(result.documents.length).toBe(1);

        // Verify cache was populated
        expect(mockStore.size).toBe(1);
        const [cachedKey, cachedVal] = Array.from(mockStore.entries())[0];
        expect(cachedKey).toContain("machine learning");
        const parsed = JSON.parse(cachedVal);
        expect(parsed.documents[0].id).toBe("doc-1");
    });

    it("2. Cache hit: returns cached data directly on second search", async () => {
        const testCacheKey = "search:prepopulated:page:1:limit:10:sort:newest";
        const cachedPayload = {
            documents: [{ id: "cached-id", title: "Cached Result" }],
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
        };
        mockStore.set(testCacheKey, JSON.stringify(cachedPayload));

        const result = await searchDocument("prepopulated", 1, 10, null, "newest");
        expect(result.documents[0].id).toBe("cached-id");
        expect(result.documents[0].title).toBe("Cached Result");
    });

    it("3. Different queries and pagination parameters generate distinct cache keys", async () => {
        await searchDocument("query-alpha", 1, 10, null, "newest");
        await searchDocument("query-beta", 1, 10, null, "newest");
        await searchDocument("query-alpha", 2, 10, null, "newest");

        expect(mockStore.size).toBe(3);
        const keys = Array.from(mockStore.keys());
        expect(keys.some((k) => k.includes("query-alpha:page:1"))).toBe(true);
        expect(keys.some((k) => k.includes("query-alpha:page:2"))).toBe(true);
        expect(keys.some((k) => k.includes("query-beta:page:1"))).toBe(true);
    });

    it("4. Different filters and sort orders generate unique keys", async () => {
        const fromDate = "2026-01-01T00:00:00.000Z";
        const toDate = "2026-12-31T23:59:59.000Z";

        await searchDocument("filter-test", 1, 10, null, "newest");
        await searchDocument("filter-test", 1, 10, null, "oldest");
        await searchDocument("filter-test", 1, 10, null, "newest", fromDate, toDate);

        expect(mockStore.size).toBe(3);
        const keys = Array.from(mockStore.keys());
        expect(keys.some((k) => k.includes("sort:newest"))).toBe(true);
        expect(keys.some((k) => k.includes("sort:oldest"))).toBe(true);
        expect(keys.some((k) => k.includes("from:") && k.includes("to:"))).toBe(true);
    });

    it("5. Stale results after document changes: invalidateSearchCache clears all search keys", async () => {
        mockStore.set("search:first:page:1", JSON.stringify({}));
        mockStore.set("search:second:page:1", JSON.stringify({}));
        mockStore.set("user:session:123", "active"); // Should not be deleted

        const deleted = await invalidateSearchCache();
        expect(deleted).toBe(2);
        expect(mockStore.has("user:session:123")).toBe(true);
        expect(mockStore.has("search:first:page:1")).toBe(false);
    });

    it("6. Redis unavailable / network error: search does not crash and safely falls back to database", async () => {
        vi.spyOn(redis, "get").mockRejectedValueOnce(new Error("ENOTFOUND connection failed"));
        vi.spyOn(redis, "set").mockRejectedValueOnce(new Error("Connection reset"));

        // Must not throw error
        const result = await searchDocument("resilience-test", 1, 10, null, "newest");
        expect(result).toBeDefined();
        expect(result.documents.length).toBe(1);
    });

    it("7. Invalid or corrupted cached data: handles auto-parsed object and returns valid response", async () => {
        const corruptedKey = "search:corrupted:page:1:limit:10:sort:newest";
        mockStore.set(corruptedKey, { documents: [{ id: "auto-parsed" }], page: 1, limit: 10, total: 1 });

        const result = await searchDocument("corrupted", 1, 10, null, "newest");
        expect(result.documents[0].id).toBe("auto-parsed");
    });
});
