
import express from "express";
import cors from "cors";
import { pool } from "./db";
import tripsRouter from "./routes/trips";
import authRouter from "./routes/auth";
import vehiclesRouter from "./routes/vehicles";
import bookingsRouter from "./routes/bookings";

const app = express();
const PORT = 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/api/trips", tripsRouter);
app.use("/api/auth", authRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/bookings", bookingsRouter);

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
  } catch (error) {
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