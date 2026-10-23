
import dotenv from "dotenv";
import { Pool } from "pg";

// Load database settings from the root project's .env file
dotenv.config({ path: "../.env" });

export const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  database: process.env.POSTGRES_DB || "routeback",
  user: process.env.POSTGRES_USER || "routeback_user",
  password: process.env.POSTGRES_PASSWORD,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL connection error:", error.message);
});