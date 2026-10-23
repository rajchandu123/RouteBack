import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";

const router = Router();

const vehicleSchema = z.object({
  owner_id: z.coerce.number().int().positive(),
  registration_number: z
    .string()
    .trim()
    .min(3)
    .max(30),
  vehicle_type: z
    .string()
    .trim()
    .min(2)
    .max(50),
  capacity_kg: z.coerce.number().positive(),
});


// ==========================================
// GET VEHICLES OF AN OWNER
// ==========================================

router.get("/owner/:ownerId", async (req, res) => {
  const ownerId = Number(req.params.ownerId);

  if (!Number.isInteger(ownerId) || ownerId <= 0) {
    return res.status(400).json({
      message: "Invalid owner ID.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
        id,
        owner_id,
        registration_number,
        vehicle_type,
        capacity_kg,
        verification_status
       FROM vehicles
       WHERE owner_id = $1
       ORDER BY id DESC`,
      [ownerId]
    );

    return res.json({
      count: result.rowCount,
      vehicles: result.rows,
    });
  } catch (error) {
    console.error("Vehicle fetch failed:", error);

    return res.status(500).json({
      message: "Unable to fetch vehicles right now.",
    });
  }
});


// ==========================================
// ADD NEW VEHICLE
// ==========================================

router.post("/", async (req, res) => {
  const parsed = vehicleSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid vehicle details.",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const {
    owner_id,
    registration_number,
    vehicle_type,
    capacity_kg,
  } = parsed.data;

  try {

    // Check whether owner exists
    const ownerResult = await pool.query(
      `SELECT id, role
       FROM users
       WHERE id = $1`,
      [owner_id]
    );

    if (ownerResult.rowCount === 0) {
      return res.status(404).json({
        message: "Vehicle owner not found.",
      });
    }

    const owner = ownerResult.rows[0];

    if (owner.role !== "owner") {
      return res.status(400).json({
        message: "Only users with owner role can add vehicles.",
      });
    }


    // Check duplicate registration number
    const existingVehicle = await pool.query(
      `SELECT id
       FROM vehicles
       WHERE LOWER(registration_number) =
             LOWER($1)`,
      [registration_number]
    );

    if (existingVehicle.rowCount && existingVehicle.rowCount > 0) {
      return res.status(409).json({
        message: "A vehicle with this registration number already exists.",
      });
    }


    // Insert vehicle
    const result = await pool.query(
      `INSERT INTO vehicles (
        owner_id,
        registration_number,
        vehicle_type,
        capacity_kg,
        verification_status
      )
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING
        id,
        owner_id,
        registration_number,
        vehicle_type,
        capacity_kg,
        verification_status`,
      [
        owner_id,
        registration_number.toUpperCase(),
        vehicle_type,
        capacity_kg,
      ]
    );

    return res.status(201).json({
      message: "Vehicle added successfully.",
      vehicle: result.rows[0],
    });

  } catch (error) {
    console.error("Vehicle creation failed:", error);

    return res.status(500).json({
      message: "Unable to add vehicle right now.",
    });
  }
});


export default router;