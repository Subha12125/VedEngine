import { searchDocumentController, getSuggestions } from "../controller/search.controller.js";

// Search route
// @param fastify - fastify instance
// @param options - options
export default async function searchRoutes(fastify){
    // Search document
    // GET /api/v1/search?q=query&page=1&limit=10
    fastify.get("/", searchDocumentController);

    // Search suggestion
    // GET /api/v1/search/suggestions?q=query
    fastify.get("/suggestions", getSuggestions);
}