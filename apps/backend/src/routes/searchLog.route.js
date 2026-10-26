import { getRecentSearcheController, getTrendingSearcheController } from "../controller/searchLog.controller.js";

export const searchLogRoutes = async (fastify) => {

    // Route for getting search logs (default to recent)
    fastify.get("/", getRecentSearcheController);

    // Route for getting recent searches
    fastify.get("/recent", getRecentSearcheController);

    // Route for getting trending searches
    fastify.get("/trending", getTrendingSearcheController);
}