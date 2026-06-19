import fastify from "fastify";
import { getRecentSearcheController, getTrendingSearcheController } from "../controller/searchLog.controller.js";

export const searchLogRoutes = async (fastify) => {

    // Route for getting recent searches
    fastify.get("/recent", getRecentSearcheController);

    // Route for getting trending searches
    fastify.get("/trending", getTrendingSearcheController);
}