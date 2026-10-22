import type { Request, Response } from "express";
import { pool } from "../connectDB.js";

// GET /record/loans
export const getAllLoans = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await pool.query(
      `SELECT
          l.id,
          l.user_id,
          l.friend_name,
          l.amount,
          l.due_date,
          l.notes,
          CASE
            WHEN l.receipt_image_url IS NOT NULL
            THEN encode(l.receipt_image_url, 'base64')
            ELSE NULL
          END AS receipt_image,
          l.created_at,
          l.updated_at,

          COALESCE(SUM(r.amount), 0) AS total_repaid,

          l.amount - COALESCE(SUM(r.amount), 0) AS remaining_amount,

          CASE
            WHEN l.amount - COALESCE(SUM(r.amount), 0) = 0
              THEN 'repaid'
            WHEN l.due_date < CURRENT_DATE
              THEN 'overdue'
            WHEN COALESCE(SUM(r.amount), 0) > 0
              THEN 'partially_paid'
            ELSE 'pending'
          END AS status

       FROM loans l

       LEFT JOIN repayments r
         ON r.loan_id = l.id

       WHERE l.user_id = $1

       GROUP BY l.id

       ORDER BY l.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      loans: result.rows,
    });
  } catch (error) {
    console.error("Fetch loans error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch loans",
    });
  }
};

// GET /record/repayments
export const getAllRepayments = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await pool.query(
      `SELECT
          r.id,
          r.loan_id,
          r.amount,
          r.image_url,
          r.notes,
          r.repayment_date,
          r.created_at,
          l.friend_name,
          l.amount AS original_loan_amount

       FROM repayments r

       INNER JOIN loans l
         ON r.loan_id = l.id

       WHERE l.user_id = $1

       ORDER BY r.repayment_date DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      repayments: result.rows,
    });
  } catch (error) {
    console.error("Fetch repayments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch repayments",
    });
  }
};