import { healthCheckController } from "../controller/healthcheck.controller.js";

// Route for health check endpoint
async function healthCheckRoute(fastify){
    fastify.get('/health', healthCheckController);
}

export default healthCheckRoute;