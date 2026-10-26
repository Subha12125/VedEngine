import { redis } from "../config/redis.config.js";

/**
 * Invalidate all search-related cache entries from Upstash Redis.
 *
 * Flow:
 *   Old Search Results → Upload New Document → Cache is stale
 *   → Clear cache → Next search rebuilds fresh cache
 *
 * Uses cursor-based SCAN instead of KEYS to avoid blocking Redis
 * in production when there are many keys.
 *
 * @returns {Promise<number>} Number of cache keys deleted
 */
export async function invalidateSearchCache() {
    let deletedCount = 0;
    let cursor = 0;

    try {
        do {
            // SCAN for keys matching the search cache pattern
            // Upstash Redis .scan() returns [nextCursor, keys[]]
            const [nextCursor, keys] = await redis.scan(cursor, {
                match: "search:*",
                count: 100,
            });

            cursor = nextCursor;

            if (keys.length > 0) {
                // Delete found keys in batch
                await redis.del(...keys);
                deletedCount += keys.length;
            }
        } while (cursor !== 0 && cursor !== "0" && cursor != null);

        if (deletedCount > 0) {
            console.log(`🗑️  Search cache invalidated: ${deletedCount} key(s) cleared`);
        } else {
            console.log("ℹ️  No search cache entries to invalidate");
        }

        return deletedCount;
    } catch (error) {
        // Cache invalidation should never break the upload flow
        console.error("⚠️  Cache invalidation failed (non-blocking):", error.message);
        return 0;
    }
}
