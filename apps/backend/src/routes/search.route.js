import { searchDocumentController, getSuggestions } from "../controller/search.controller.js";
import { searchSchema, searchSuggestionSchema } from "../validators/search.validator.js";

// Zod validation preHandler for Fastify
const validateQuery = (schema) => async (request, reply) => {
    const result = schema.safeParse(request.query);
    if (!result.success) {
        return reply.code(400).send({
            status: "error",
            message: result.error.issues[0].message,
            errors: result.error.issues,
        });
    }
    // Replace query with parsed/coerced values (e.g. string "1" → number 1)
    request.query = result.data;
};

// Search route
// @param fastify - fastify instance
// @param options - options
export default async function searchRoutes(fastify){
    // Search document
    // GET /api/v1/search?q=query&page=1&limit=10
    fastify.get("/", { preHandler: validateQuery(searchSchema) }, searchDocumentController);

    // Search suggestion
    // GET /api/v1/search/suggestions?q=query
    fastify.get("/suggestions", { preHandler: validateQuery(searchSuggestionSchema) }, getSuggestions);
}