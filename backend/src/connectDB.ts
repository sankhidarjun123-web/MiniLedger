import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();
// Initialize the connection pool
export const pool = new Pool({
  connectionString: process.env.CONNECTION_STRING,
});