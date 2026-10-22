import type { Request, Response } from "express";
import { pool } from "../connectDB.js";
import { randomInt } from "crypto";
import jwt from "jsonwebtoken";


const otpStore = new Map<
  string,
  { otp: string; expiresAt: number }
>();


export const getCurrentUser = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT id, mobile_number, is_verified
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        mobileNumber: user.mobile_number,
        isVerified: user.is_verified,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const registerUser = async (req: Request, res: Response) => {
  try {
    const { mobileNumber } = req.body;

    console.log(mobileNumber);
    // Validate mobile number
    if (!mobileNumber || !/^[0-9]{10}$/.test(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number",
      });
    }

    // Find existing user
    let result = await pool.query(
      `SELECT id, mobile_number, is_verified
       FROM users
       WHERE mobile_number = $1`,
      [mobileNumber]
    );

    let user;

    if (result.rows.length === 0) {
      // Register new user
      result = await pool.query(
        `INSERT INTO users (mobile_number, is_verified)
         VALUES ($1, FALSE)
         RETURNING id, mobile_number, is_verified`,
        [mobileNumber]
      );

      user = result.rows[0];
    } else {
      user = result.rows[0];
    }

    // Generate OTP
    const otp = randomInt(100000, 1000000).toString();

    // Store OTP (expires in 5 minutes)
    otpStore.set(mobileNumber, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Mock OTP delivery
    console.log(`OTP for ${mobileNumber}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      user: {
        id: user.id,
        mobileNumber: user.mobile_number,
        isVerified: user.is_verified,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and OTP are required",
      });
    }

    // Get stored OTP
    const storedOTP = otpStore.get(mobileNumber);

    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP",
      });
    }

    // Check expiry
    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(mobileNumber);

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Verify OTP
    if (storedOTP.otp !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Find user and mark as verified
    const result = await pool.query(
      `UPDATE users
       SET is_verified = TRUE
       WHERE mobile_number = $1
       RETURNING id, mobile_number, is_verified`,
      [mobileNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];

    // Remove OTP after successful verification
    otpStore.delete(mobileNumber);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user: {
        id: user.id,
        mobileNumber: user.mobile_number,
        isVerified: user.is_verified,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};