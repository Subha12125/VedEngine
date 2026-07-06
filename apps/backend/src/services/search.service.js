import { prisma } from "../config/prisma.config.js";
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
                {title:{contains:query}, mode: "insensitive"},
                {content:{contains:query}, mode: "insensitive"},
            ]
        };

        // Finding documents and total count
        // Using Promise.all to find documents and total count
        const [documents, total] = await Promise.all([
            prisma.document.findMany({
                where,
                skip, 
                take: limit,
                orderBy: {
                    createdAt:
                        sort === "newest" ? "desc" : "asc"
                }
            }),
            prisma.document.count({where})
        ]);
        
        // Returning documents and meta data
        return {
            documents,
            page,
            limit,
            total,
            totalPages: Math.ceil(total/limit),
        };

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

