import fastify from "fastify";
import healthCheckRoute from "./routes/health.routes.js";

// Build the Fastify app
const buildApp = async()=> {
    const app = fastify({
        logger: true,
    })
    await app.register(healthCheckRoute, { prefix: '/api/v1' });
    return app;
}

export default buildApp;

