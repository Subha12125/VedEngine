import prisma from "../config/prisma.config.js";

// Creating Search Log in Database
// @param {string} query - The search query to log.
// @returns {Promise<object>} The created search log entry or an error object.
export const createSearchLog = async (query) => {
    try {
        return await prisma.searchLog.create({ data: { query: query } });
    } catch (error) {
        console.error("Failed to create search log:", error.message);
        throw error;
    }
}

// Getting Recent Searches from Database
// @returns {Promise<array>} The array of recent search logs or an error object.
// Take the limit of 10 
export const getRecentSearches = async () => {
    try {
        return await prisma.searchLog.findMany({
            distinct: ["query"],
            orderBy: { createdAt: "desc" },
            take: 10
        })
    } catch (error) {
        console.error("Failed to get recent searches:", error.message);
        throw error;
    }
}

// GET all the trending searches
// @returns {Promise<array>} The array of trending search logs or an error object.
// Get the all the queries that are searched most frequently
// Take the limit of 10 
export const getTrendingSearches = async () => {
    try {
        return await prisma.searchLog.groupBy({
            by: ["query"],
            orderBy: { _count: { query: "desc" } },
            take: 10
        })
    } catch (error) {
        console.error("Failed to get trending searches:", error.message);
        throw error;
    }
}