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


// UPDATE LOAN
export const updateLoan = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { loanId } = req.params;
    const { friendName, amount, dueDate, notes } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

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
        message: "Invalid due date",
      });
    }

    // Keep the existing image if no new image was uploaded.
    const receiptImage = req.file?.buffer ?? null;

    const result = await pool.query(
      `UPDATE loans
       SET
         friend_name = $1,
         amount = $2,
         due_date = $3,
         notes = $4,
         receipt_image_url = COALESCE($5, receipt_image_url),
         updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING
         id,
         friend_name,
         amount,
         due_date,
         notes,
         created_at,
         updated_at`,
      [
        friendName.trim(),
        parsedAmount,
        dueDate,
        notes?.trim() || null,
        receiptImage,
        loanId,
        userId,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Loan updated successfully",
      loan: result.rows[0],
    });
  } catch (error) {
    console.error("Update loan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update loan",
    });
  }
};


// DELETE LOAN
export const deleteLoan = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const userId = req.userId;
    const { loanId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await client.query("BEGIN");

    // Verify ownership before deleting anything.
    const loan = await client.query(
      `SELECT id FROM loans
       WHERE id = $1 AND user_id = $2
       FOR UPDATE`,
      [loanId, userId]
    );

    if (loan.rowCount === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    // Delete associated repayments first.
    await client.query(
      "DELETE FROM repayments WHERE loan_id = $1",
      [loanId]
    );

    // Delete the loan.
    await client.query(
      "DELETE FROM loans WHERE id = $1 AND user_id = $2",
      [loanId, userId]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Loan and associated repayments deleted successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Delete loan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete loan",
    });
  } finally {
    client.release();
  }
};