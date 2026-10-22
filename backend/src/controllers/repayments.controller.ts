import type { Request, Response } from "express";
import { pool } from "../connectDB.js";

export const addRepayment = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { loanId, amount, repaymentDate, notes } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const parsedAmount = Number(amount);

  if (
    !loanId ||
    !Number.isFinite(parsedAmount) ||
    parsedAmount <= 0 ||
    !/^\d+(\.\d{1,2})?$/.test(String(amount))
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid loan ID and repayment amount are required.",
    });
  }

  const parsedDate = repaymentDate
    ? new Date(repaymentDate)
    : new Date();

  if (Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Invalid repayment date.",
    });
  }

  const imageUrl = req.file
    ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
    : null;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const loanResult = await client.query(
      `SELECT id, amount
       FROM loans
       WHERE id = $1 AND user_id = $2
       FOR UPDATE`,
      [loanId, userId]
    );

    if (loanResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Loan not found.",
      });
    }

    const loanAmount = Number(loanResult.rows[0].amount);

    const repaymentResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_repaid
       FROM repayments
       WHERE loan_id = $1`,
      [loanId]
    );

    const totalRepaid = Number(
      repaymentResult.rows[0].total_repaid
    );

    const remainingAmount = loanAmount - totalRepaid;

    if (parsedAmount > remainingAmount) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: `Repayment exceeds the outstanding balance of ₹${remainingAmount.toFixed(2)}.`,
        remainingAmount,
      });
    }

    const result = await client.query(
      `INSERT INTO repayments
        (loan_id, amount, image_url, repayment_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, loan_id, amount, image_url, repayment_date, notes, created_at`,
      [
        loanId,
        parsedAmount,
        imageUrl,
        parsedDate.toISOString(),
        typeof notes === "string" ? notes.trim() || null : null,
      ]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Repayment recorded successfully.",
      repayment: result.rows[0],
      remainingAmount: remainingAmount - parsedAmount,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Add repayment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to record repayment.",
    });
  } finally {
    client.release();
  }
};


// Update repayment
export const updateRepayment = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { repaymentId } = req.params;
  const { amount, repaymentDate, notes } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const parsedAmount = Number(amount);

  if (
    !amount ||
    !Number.isFinite(parsedAmount) ||
    parsedAmount <= 0 ||
    !/^\d+(\.\d{1,2})?$/.test(String(amount).trim())
  ) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid repayment amount.",
    });
  }

  const parsedDate = new Date(repaymentDate);

  if (!repaymentDate || Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid repayment date.",
    });
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    // Lock the loan to prevent concurrent repayment changes.
    const loanResult = await client.query(
      `SELECT l.id, l.amount
       FROM loans l
       JOIN repayments r ON r.loan_id = l.id
       WHERE r.id = $1 AND l.user_id = $2
       FOR UPDATE OF l`,
      [repaymentId, userId]
    );

    if (loanResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Repayment or loan not found.",
      });
    }

    const loan = loanResult.rows[0];

    // Calculate other repayments, excluding the one being edited.
    const repaymentTotalResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM repayments
       WHERE loan_id = $1 AND id <> $2`,
      [loan.id, repaymentId]
    );

    const otherRepayments = Number(
      repaymentTotalResult.rows[0].total
    );

    const remainingAllowed = Number(loan.amount) - otherRepayments;

    if (parsedAmount > remainingAllowed) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(400).json({
        success: false,
        message: `The repayment cannot exceed ₹${remainingAllowed.toLocaleString("en-IN")}.`,
      });
    }

    const imageUrl = req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
      : null;

    const result = await client.query(
      `UPDATE repayments
       SET
         amount = $1,
         repayment_date = $2,
         notes = $3,
         image_url = COALESCE($4, image_url)
       WHERE id = $5
       RETURNING *`,
      [
        parsedAmount,
        parsedDate,
        notes?.trim() || null,
        imageUrl,
        repaymentId,
      ]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Repayment updated successfully.",
      repayment: result.rows[0],
    });
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    console.error("Update repayment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update repayment.",
    });
  } finally {
    client.release();
  }
};

// Delete repayment
export const deleteRepayment = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { repaymentId } = req.params;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM repayments r
       USING loans l
       WHERE r.loan_id = l.id
         AND r.id = $1
         AND l.user_id = $2
       RETURNING r.*`,
      [repaymentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Repayment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Repayment deleted successfully.",
      repayment: result.rows[0],
    });
  } catch (error) {
    console.error("Delete repayment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete repayment.",
    });
  }
};
