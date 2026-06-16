import buildApp from "./app.js";
import { PORT } from "./config/env.config.js";

const startServer = async () => {
  try {
    const app = await buildApp();

    await app.listen({
      port: PORT,
      host: "0.0.0.0",
    });

    console.log(`VedEngine API running on port ${PORT}`);
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();