import prisma from "../config/prisma.config.js";
import { redis } from "../config/redis.config.js";

// Search document
// @param query - query string
// @param page - page number
// @param limit - number of results per page
// @param userId - user id
// @param sort - sort order (newest or oldest)
// @returns - success response
export const searchDocument = async (query, page = 1, limit = 10, userId = null, sort = "newest") => {
    try{
        const skip = (page - 1)*limit;

        /**
         * Key format: search:<query>:page:<page>:limit:<limit>:sort:<sort>
        */
        // To create unique key for each search.
        // Why ? : Because each search will have different query, page, limit and sort.

        const cacheKey = `search:${query}:page:${page}:limit:${limit}:sort:${sort}`;

        // Checking cache
        const cachedData = await redis.get(cacheKey);
        if(cachedData){
            console.log("✅ Cache hit ✅");
            return JSON.parse(cachedData);
        }
        console.log("❌ Cache miss ❌");
        
        // Search where query is present in title or content
        const where = {
            OR:[
                {title:{contains:query, mode: "insensitive"}},
                {content:{contains:query, mode: "insensitive"}},
            ]
        };

        /*
            ts_rank - Calculates the ranking of documents based on the query.
            plainto_tsquery - Converts a query string to a tsquery value.
            @@ - performs the tsquery match.
            to_tsvector - Converts a text to a tsvector value.
        */

        const document = await prisma.$queryRaw`
        SELECT  
            id,
            title,
            content,
            "createdAt",
            "updatedAt"
            ts_rank(
                search_vector,
                plainto_tsquery('english', ${query})
            ) AS RANK
        FROM 
            "Document"
        WHERE
            to_tsvector('english',title || '' || content)
            @@
            plainto_tsquery('english', ${query})
        ORDER BY
            RANK ${sort === "newest" ? "DESC" : "ASC"}
        LIMIT ${limit}
        OFFSET ${skip};
        `;

        // Getting total number of documents for pagination
        // without RANK
        const countResult = await prisma.$queryRaw`
        SELECT
            COUNT(*) AS total
        FROM
            "Document"
        WHERE
            to_tsvector('english',title || '' || content)
            @@
            plainto_tsquery('english', ${query});
        `;

        // Converting total count to number
        const total = Number(countResult[0].total);
        
        // Returning documents and meta data
        const result = {
            documents,
            page,
            limit,
            total,
            totalPages: Math.ceil(total/limit),
        };

        // Cache the result for 1 day (86400 seconds)
        await redis.set(cacheKey, JSON.stringify(result), { ex: 86400 });

        return result;

    }
    catch(error){
        throw error;
    }
}

// Search suggestion
// @param query - query string
// @param limit - number of results per page
// @param userId - user id
// @returns - success response
export const searchSuggestion = async (query, limit = 10, userId = null) => {
    try {
        // Finding documents where title starts with query
        return await prisma.document.findMany({
            where: {
                title: {
                    startsWith : query,
                    mode : "insensitive"
                }
            },

            // Selecting only id and title
            select: {
                id: true,
                title: true,
            },

            take: limit,
            orderBy : {
                title : "asc"
            }
        });
    }
    catch(error){
        throw error;
    }
}

