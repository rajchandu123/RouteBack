import { Router } from "express";
import { pool } from "../db";

const router = Router();

router.get("/customer/:customerId", async (req, res) => {
  const customerId = Number(req.params.customerId);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return res.status(400).json({
      message: "Invalid customer ID.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         b.id,
         b.trip_id,
         b.goods_description,
         b.weight_kg,
         b.quoted_price,
         b.status,
         t.origin_city,
         t.destination_city,
         t.departure_at,
         t.status AS trip_status,
         v.vehicle_type
       FROM bookings b
       JOIN trips t
         ON t.id = b.trip_id
       JOIN vehicles v
         ON v.id = t.vehicle_id
       WHERE b.customer_id = $1
       ORDER BY b.id DESC`,
      [customerId],
    );

    return res.json({
      count: result.rowCount,
      bookings: result.rows,
    });
  } catch (error) {
    console.error("Customer bookings loading failed:", error);

    return res.status(500).json({
      message: "Unable to load customer bookings right now.",
    });
  }
});

// Create a booking for an available trip
router.post("/", async (req, res) => {
  const {
    trip_id,
    customer_id,
    goods_description,
    weight_kg,
  } = req.body;

  if (
    !trip_id ||
    !customer_id ||
    !goods_description ||
    !weight_kg
  ) {
    return res.status(400).json({
      message: "All booking fields are required.",
    });
  }

  const weight = Number(weight_kg);

  if (!Number.isFinite(weight) || weight <= 0) {
    return res.status(400).json({
      message: "Goods weight must be greater than 0.",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the trip while checking and updating capacity.
    const tripResult = await client.query(
      `SELECT
  id,
  available_capacity_kg,
  initial_capacity_kg,
  price,
  status
FROM trips
       WHERE id = $1
       FOR UPDATE`,
      [trip_id],
    );

    if (tripResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Trip not found.",
      });
    }

    const trip = tripResult.rows[0];

    if (trip.status !== "available") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "This trip is no longer available.",
      });
    }

    if (Number(trip.available_capacity_kg) < weight) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: `Only ${trip.available_capacity_kg} kg capacity is available.`,
      });
    }

    // For the MVP, calculate the booking price
    // proportionally from the trip price and capacity.
    const quotedPrice =
  trip.price === null
    ? null
    : (
        Number(trip.price) *
        (weight / Number(trip.initial_capacity_kg))
      ).toFixed(2);

    const bookingResult = await client.query(
      `INSERT INTO bookings (
        trip_id,
        customer_id,
        goods_description,
        weight_kg,
        quoted_price,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING
        id,
        trip_id,
        customer_id,
        goods_description,
        weight_kg,
        quoted_price,
        status`,
      [
        trip_id,
        customer_id,
        goods_description.trim(),
        weight,
        quotedPrice,
      ],
    );

    const remainingCapacity =
      Number(trip.available_capacity_kg) - weight;

    const newStatus =
      remainingCapacity === 0
        ? "fully_booked"
        : "available";

    await client.query(
      `UPDATE trips
       SET
         available_capacity_kg = $1,
         status = $2
       WHERE id = $3`,
      [
        remainingCapacity,
        newStatus,
        trip_id,
      ],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Booking created successfully.",
      booking: bookingResult.rows[0],
      remaining_capacity_kg: remainingCapacity,
      trip_status: newStatus,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Booking creation failed:", error);

    return res.status(500).json({
      message: "Unable to create booking right now.",
    });
  } finally {
    client.release();
  }
});

export default router;