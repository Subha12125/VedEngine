import { searchDocument, searchSuggestion } from "../services/search.service.js";

import { createSearchLog } from "../services/searchLog.service.js";

// Search document
// @param request - request object
// @param reply - reply object
// @param query - query string
// @param page - page number
// @param limit - number of results per page
// @param userId - user id
// @param sort - sort order (newest or oldest)
// @returns - success response

export const searchDocumentController = async(request, reply) => {
    try{
        const startTime = Date.now();

        // Destructure query parameters
        /*
            q - query string
            page - page number
            limit - number of results per page
            userId - user id
            sort - sort order (newest or oldest)
        */
        const {
            q,
            page=1,
            limit=10,
            userId = null,
            sort="newest",
            from = null,
            to = null
        } = request.query;

        // Check for empty query
        if(!q?.trim()) {
            return reply.code(400).send({
                status: "error",
                message: "Query is required"
            });
        }

        // Check if query length is less than 2
        if(q.trim().length < 2){
            return reply.code(400).send({
                status: "error",
                message: "Query must be atleast two characters"
            });
        }
        // Creating search log 
        await createSearchLog(q);

        // Searching documents
        const results = await searchDocument(
            q, 
            Number(page), 
            Number(limit), 
            null, 
            sort,
            from,
            to
        );
        
        const endTime = Date.now();

        const timeTake = endTime - startTime;


        /*
            1. return success response
            2. return data
            3. return meta data
            4. return time taken
        */
        const result = {
            status:"success",
            message: "Documents found successfully",
            query: q,
            page: results.page,
            limit: results.limit,
            total: results.total,
            totalPages: results.totalPages,
            data: results.documents,
            timeTake
        };

        return reply.code(200).send(result);
    }
    catch(error){
        console.error("Error in searchDocumentController", error);
        return reply.code(500).send({
            status: "error",
            message: "Internal server error"
        });
    }
}

// Search suggestion
// @param request - request object
// @param reply - reply object
// @returns - success response
export const getSuggestions = async (request,reply) => {
    try {
        const { q } = request.query;

        if (!q?.trim()) {
            return reply.code(400).send({
                status: "error",
                message: "Query is required",
            });
        }

        const suggestions = await searchSuggestion(q);

        return reply.code(200).send({
            status: "success",
            message: "Suggestions found successfully",
            data: suggestions,
        });
    } catch (error) {
        console.error("Error in getSuggestions", error);
        return reply.code(500).send({
            status: "error",
            message: "Internal server error"
        });
    }
};