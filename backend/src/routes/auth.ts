import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { pool } from "../db";

const router = Router();

const registerSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional(),
  password: z.string().min(8).max(100),
  role: z.enum(["customer", "driver", "owner"]),
});

// Register a new user
router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid registration details.",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const {
    full_name,
    email,
    phone,
    password,
    role,
  } = parsed.data;

  try {
    const existingUser = await pool.query(
      `SELECT id
       FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [email],
    );

    if (existingUser.rowCount && existingUser.rowCount > 0) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (
        full_name,
        email,
        phone,
        password_hash,
        role
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        full_name,
        email,
        phone,
        role,
        created_at`,
      [
        full_name,
        email,
        phone || null,
        passwordHash,
        role,
      ],
    );

    return res.status(201).json({
      message: "Account created successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Registration failed:", error);

    return res.status(500).json({
      message: "Unable to create account right now.",
    });
  }
});
// Login an existing user
router.post("/login", async (req, res) => {
  const loginSchema = z.object({
    email: z.string().trim().email().max(255),
    password: z.string().min(1).max(100),
  });

  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid login details.",
    });
  }

  const { email, password } = parsed.data;

  try {
    const result = await pool.query(
      `SELECT
         id,
         full_name,
         email,
         phone,
         password_hash,
         role,
         created_at
       FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [email],
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    return res.json({
      message: "Login successful.",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);

    return res.status(500).json({
      message: "Unable to login right now.",
    });
  }
});
router.get("/drivers", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         full_name,
         email,
         phone
       FROM users
       WHERE role = 'driver'
       ORDER BY full_name ASC`,
    );

    return res.json({
      count: result.rowCount,
      drivers: result.rows,
    });
  } catch (error) {
    console.error("Driver loading failed:", error);

    return res.status(500).json({
      message: "Unable to load drivers right now.",
    });
  }
});
export default router;
