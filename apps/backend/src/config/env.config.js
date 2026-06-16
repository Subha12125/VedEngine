import dotenv from "dotenv";

dotenv.config();

// Load environment variables from .env file
export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || "development";