import type { Request, Response } from "express";
import { pool } from "../connectDB.js";

export const addLoan = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { friendName, amount, dueDate, notes } = req.body;

    // Validate required fields
    if (!friendName?.trim() || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Friend name, amount and due date are required",
      });
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid amount",
      });
    }

    if (
      typeof dueDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ||
      Number.isNaN(Date.parse(`${dueDate}T00:00:00Z`))
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid due date (YYYY-MM-DD)",
      });
    }

    // Multer provides the uploaded image as a Buffer
    const receiptImage = req.file?.buffer ?? null;

    if (req.file && !req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Only image files are allowed",
      });
    }

    // Insert loan into PostgreSQL
    const result = await pool.query(
      `INSERT INTO loans (
        user_id,
        friend_name,
        amount,
        due_date,
        notes,
        receipt_image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        user_id,
        friend_name,
        amount,
        due_date,
        notes,
        created_at`,
      [
        userId,
        friendName.trim(),
        parsedAmount,
        dueDate,
        notes?.trim() || null,
        receiptImage,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Loan added successfully",
      loan: result.rows[0],
      receiptUploaded: Boolean(receiptImage),
    });
  } catch (error) {
    console.error("Add loan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add loan",
    });
  }
};