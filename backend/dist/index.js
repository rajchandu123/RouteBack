import express from "express";
import cors from "cors";
import { pool } from "./db";
import tripsRouter from "./routes/trips";
const app = express();
const PORT = 5000;
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/api/trips", tripsRouter);
// Basic API test
app.get("/", (_req, res) => {
    res.json({
        message: "Welcome to the RouteBack API",
    });
});
// Health check: tests the API and PostgreSQL connection
app.get("/api/health", async (_req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({
            status: "ok",
            message: "RouteBack API and database are working",
            database: "connected",
        });
    }
    catch (error) {
        console.error("Database health check failed:", error);
        res.status(503).json({
            status: "error",
            message: "Database connection failed",
        });
    }
});
app.listen(PORT, () => {
    console.log(`RouteBack API running at http://localhost:${PORT}`);
});
