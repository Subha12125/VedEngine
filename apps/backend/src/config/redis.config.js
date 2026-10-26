import { Redis } from "@upstash/redis";
import "dotenv/config";

// Initialize raw Upstash Redis client
const rawRedis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
});

// In-memory cache fallback store
// Serves as write fallback if the Upstash token is read-only (NOPERM) or network is degraded
const memoryCache = new Map();
let readOnlyWarningLogged = false;

/**
 * Resilient Redis wrapper for VedEngine.
 * Provides transparent caching with Upstash Redis and automatic in-memory fallback.
 */
export const redis = {
    /**
     * Retrieve a value by key.
     */
    async get(key) {
        // 1. Check in-memory cache first
        const memEntry = memoryCache.get(key);
        if (memEntry) {
            if (Date.now() < memEntry.expiresAt) {
                return memEntry.value;
            }
            memoryCache.delete(key);
        }

        // 2. Query Upstash Redis
        try {
            const val = await rawRedis.get(key);
            if (val !== null && val !== undefined) {
                // Populate memory cache with 60s TTL
                memoryCache.set(key, { value: val, expiresAt: Date.now() + 60000 });
            }
            return val;
        } catch (err) {
            return null;
        }
    },

    /**
     * Store a key-value pair with TTL.
     */
    async set(key, value, options = {}) {
        const ttlSeconds = options?.ex || 86400;

        // 1. Always store in local memory cache
        memoryCache.set(key, {
            value,
            expiresAt: Date.now() + (ttlSeconds * 1000)
        });

        // 2. Attempt write to Upstash Redis
        try {
            return await rawRedis.set(key, value, options);
        } catch (err) {
            if (err?.message && (err.message.includes("NOPERM") || err.message.includes("permissions"))) {
                if (!readOnlyWarningLogged) {
                    console.info(
                        "ℹ️ Upstash Redis token is in READ-ONLY mode. In-memory caching active as write fallback."
                    );
                    readOnlyWarningLogged = true;
                }
                return "OK";
            }
            throw err;
        }
    },

    /**
     * Delete one or more keys.
     */
    async del(...keys) {
        let deleted = 0;
        for (const k of keys) {
            if (memoryCache.delete(k)) deleted++;
        }

        try {
            return await rawRedis.del(...keys);
        } catch (err) {
            if (err?.message && (err.message.includes("NOPERM") || err.message.includes("permissions"))) {
                return deleted;
            }
            throw err;
        }
    },

    /**
     * Scan for keys matching a pattern.
     */
    async scan(cursor, options = {}) {
        let remoteKeys = [];
        let nextCursor = 0;
        try {
            const res = await rawRedis.scan(cursor, options);
            nextCursor = Number(res[0]) || 0;
            remoteKeys = res[1] || [];
        } catch (err) {
            // remote scan failed
        }

        const pattern = options?.match || "*";
        const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`);
        const memoryKeys = Array.from(memoryCache.keys()).filter((k) => regex.test(k));
        const combined = Array.from(new Set([...remoteKeys, ...memoryKeys]));
        return [nextCursor, combined];
    },

    /**
     * Health check ping.
     */
    async ping() {
        return rawRedis.ping();
    }
};
