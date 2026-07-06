import fastify from "fastify";
import cors from "@fastify/cors";
import healthCheckRoute from "./routes/health.routes.js";
import { documentRoutes } from "./routes/document.route.js";
import { searchLogRoutes } from "./routes/searchLog.route.js";
import searchRoutes from "./routes/search.route.js";


// Build the Fastify app
const buildApp = async()=> {
    const app = fastify({
        logger: true,
    })
    // Registering CORS
    await app.register(cors);
    // Registering all routes
    await app.register(healthCheckRoute, { prefix: '/api/v1' });
    // Registering document routes
    await app.register(documentRoutes, { prefix: '/api/v1' });
    // Registering search log routes
    await app.register(searchLogRoutes, { prefix: '/api/v1/search-log' });
    // Registering search routes
    await app.register(searchRoutes, { prefix: '/api/v1/search' });
    return app;
}

export default buildApp;

