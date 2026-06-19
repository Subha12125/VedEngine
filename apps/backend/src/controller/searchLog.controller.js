import { getRecentSearches, getTrendingSearches } from "../services/searchLog.service.js";

// Getting Recent Searches from Database
// @param {Object} request - The request object.
// @param {Object} reply - The reply object.
// @returns {Promise<Object>} The response object.
export const getRecentSearcheController = async (request, reply) => {
    try {
        const recentSearch = await getRecentSearches();
        if (!recentSearch) return reply.code(404).send({ status: "Not Found", data: [], success: false });
        else return reply.code(200).send({ status: "Success", data: recentSearch, success: true });
    } catch (error) {
        return reply.code(500).send({ message: error.message, success: false })
    }
}


// Getting Trending Searches from Database
// @param {Object} request - The request object.
// @param {Object} reply - The reply object.
// @returns {Promise<Object>} The response object.
export const getTrendingSearcheController = async (request, reply) => {
    try {
        const trendingSearch = await getTrendingSearches();
        if (!trendingSearch) return reply.code(404).send({ status: "Not Found", data: [], success: false });
        else return reply.code(200).send({ status: "Success", data: trendingSearch, success: true });
    } catch (error) {
        return reply.code(500).send({ message: error.message, success: false })
    }
}