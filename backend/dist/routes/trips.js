import { Router } from "express";
import { pool } from "../db";
const router = Router();
// Search for available transport trips
router.get("/search", async (req, res) => {
    const origin = String(req.query.origin ?? "").trim();
    const destination = String(req.query.destination ?? "").trim();
    if (!origin || !destination) {
        return res.status(400).json({
            message: "Origin and destination are required.",
        });
    }
    if (origin.localeCompare(destination, undefined, {
        sensitivity: "accent",
    }) === 0) {
        return res.status(400).json({
            message: "Origin and destination must be different.",
        });
    }
    try {
        const result = await pool.query(`SELECT
         t.id,
         t.origin_city,
         t.destination_city,
         t.departure_at,
         t.available_capacity_kg,
         t.price,
         t.status,
         v.vehicle_type AS vehicle_type
       FROM trips t
       JOIN vehicles v ON v.id = t.vehicle_id
       WHERE LOWER(t.origin_city) = LOWER($1)
         AND LOWER(t.destination_city) = LOWER($2)
         AND t.status = 'available'
         AND t.departure_at >= NOW()
         AND t.available_capacity_kg > 0
       ORDER BY t.departure_at ASC`, [origin, destination]);
        return res.json({
            count: result.rowCount,
            trips: result.rows,
        });
    }
    catch (error) {
        console.error("Trip search failed:", error);
        return res.status(500).json({
            message: "Unable to search trips right now.",
        });
    }
});
export default router;
