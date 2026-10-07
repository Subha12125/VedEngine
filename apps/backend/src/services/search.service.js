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
export const searchDocument = async (
  query,
  page = 1,
  limit = 10,
  userId = null,
  sort = "newest",
) => {
  try {
    const skip = (page - 1) * limit;

    /**
     * Key format: search:<query>:page:<page>:limit:<limit>:sort:<sort>
     */
    // To create unique key for each search.
    // Why ? : Because each search will have different query, page, limit and sort.

    const cacheKey = `search:${query.trim().toLowerCase()}:page:${page}:limit:${limit}:sort:${sort}`;

    // Checking cache — wrapped in try-catch so search still works if Redis is unavailable
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log("✅ Cache hit ✅");
        // Upstash redis client auto-parses JSON, so cachedData may already be an object
        if (typeof cachedData === "string") {
          return JSON.parse(cachedData);
        }
        return cachedData;
      }
    } catch (redisErr) {
      console.warn(
        "⚠ Redis cache read failed, querying database directly:",
        redisErr.message,
      );
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
    const orderDirection =
      sort === "newest" ? Prisma.sql`DESC` : Prisma.sql`ASC`;

    let documents = [];
    let total = 0;

    try {
      documents = await prisma.$queryRaw`
                SELECT
                    id,
                    title,
                    description,
                    url,
                    "fileType",
                    "fileName",
                    "fileUrl",
                    ts_headline(
                        'english',
                        COALESCE(content, ''),
                        plainto_tsquery('english', ${query}),
                        'StartSel=<mark>, StopSel=</mark>, MaxWords=20, MinWords=3'
                    ) AS snippet,
                    "createdAt",
                    "updatedAt",
                    ts_rank(
                        search_vector,
                        plainto_tsquery('english', ${query})
                    ) AS rank
                FROM "Document"
                WHERE search_vector @@ plainto_tsquery('english', ${query})
                ORDER BY rank DESC, "createdAt" ${orderDirection}
                LIMIT ${limit}
                OFFSET ${skip};
`;

      /**
       * COUNT query
       */
      const countResult = await prisma.$queryRaw`
                SELECT COUNT(*) AS total
                FROM "Document"
                WHERE search_vector @@ plainto_tsquery('english', ${query});
`;

      total = Number(countResult[0]?.total || 0);
    } catch (rawErr) {
      console.warn(
        "⚠ Raw full-text search query failed, using fallback:",
        rawErr.message,
      );
    }

    // Fallback to substring matching if full-text search yielded no results
    if (!documents || documents.length === 0) {
      console.log(
        "ℹ Full-text search returned 0 results. Using substring fallback search...",
      );
      const whereClause = {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      };

      const [fallbackDocs, fallbackTotal] = await Promise.all([
        prisma.document.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: sort === "newest" ? "desc" : "asc" },
        }),
        prisma.document.count({ where: whereClause }),
      ]);

      total = fallbackTotal;
      documents = fallbackDocs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        url: doc.url,
        fileType: doc.fileType,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        snippet:
          doc.description ||
          doc.content?.substring(0, 150) ||
          "No snippet available",
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        rank: 1,
      }));
    }

    // Returning documents and metadata
    const result = {
      documents,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };

    // Cache the result for 1 day (86400 seconds) — non-blocking if Redis fails
    try {
      await redis.set(cacheKey, JSON.stringify(result), { ex: 86400 });
    } catch (redisErr) {
      console.warn("⚠ Redis cache write failed:", redisErr.message);
    }

    return result;
  } catch (error) {
    throw error;
  }
};

// Search suggestion
// @param query - query string
// @param limit - number of results per page
// @param userId - user id
// @returns - success response
export const searchSuggestion = async (query, limit = 10, userId = null) => {
  try {
    // Finding documents where title contains query (case-insensitive)
    return await prisma.document.findMany({
      where: {
        title: {
          contains: query,
          mode: "insensitive",
        },
      },

      // Selecting id, title, and url
      select: {
        id: true,
        title: true,
        url: true,
      },

      take: limit,
      orderBy: {
        title: "asc",
      },
    });
  } catch (error) {
    throw error;
  }
};
