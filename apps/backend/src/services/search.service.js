import prisma from "../config/prisma.config.js";
import { redis } from "../config/redis.config.js";
import { Prisma } from "../generated/prisma/client.ts";

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

        const cacheKey = `search:${query.trim().toLowerCase()}:page:${page}:limit:${limit}:sort:${sort}`;

        // Checking cache
        const cachedData = await redis.get(cacheKey);
        if(cachedData){
            console.log("✅ Cache hit ✅");
            // Upstash redis client auto-parses JSON, so cachedData may already be an object
            if (typeof cachedData === "string") {
                return JSON.parse(cachedData);
            }
            return cachedData;
        }
        console.log("❌ Cache miss ❌");

        /** 
         * ts_rank - Calculates the ranking of documents based on the query.
         * plainto_tsquery - Converts a query string to a tsquery value.
         * @@ - performs the tsquery match.
         * to_tsvector - Converts a text to a tsvector value.
         * ts_headline() - Generates a highlighted version of the document, 
         * replacing search terms with HTML tags (by default `<b>` and `</b>`).
         * 
         * Parameters:
         * 1. 'english' - The dictionary to use for tokenization and stemming.
         * 2. content - The text to search within.
         * 3. plainto_tsquery('english', ${query}) - The query to search for.
         * 4. 'StartGroup=<b> StopGroup=</b> MaxWords=20 MinWords=3 RankWords=10'
         *    - StartGroup=<b>, StopGroup=</b>: These define the tags to wrap around the matched terms.
         *    - MaxWords=20: The maximum number of words to include in the snippet.
         *    - MinWords=3: The minimum number of words to include in the snippet.
         *    - RankWords=10: The number of top-ranked words to prioritize in the snippet.
         */

        // Build ORDER BY direction safely — SQL keywords cannot be parameterized,
        // so we use Prisma.sql to inject a trusted literal.
        const orderDirection = sort === "newest" ? Prisma.sql`DESC` : Prisma.sql`ASC`;

        const documents = await prisma.$queryRaw`
        SELECT  
            id,
            title,
            ts_headline(
                'english',
                content,
                plainto_tsquery('english', ${query}),
                'StartSel=<mark>, StopSel=</mark>, MaxWords=20, MinWords=3'
            ) AS snippet,
            "createdAt",
            "updatedAt",
            ts_rank(
                to_tsvector('english', title || ' ' || content),
                plainto_tsquery('english', ${query})
            ) AS rank
        FROM 
            "Document"
        WHERE
            to_tsvector('english', title || ' ' || content)
            @@
            plainto_tsquery('english', ${query})
        ORDER BY
            rank ${orderDirection}
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
            to_tsvector('english', title || ' ' || content)
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
