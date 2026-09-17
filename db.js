

import pg from "pg";
import dotenv from 'dotenv';

dotenv.config();

const {Pool} = pg;

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
})



pool.query("SELECT NOW()")
  .then((res) =>console.log("✅ DB connected at:", res.rows[0].now))
  .catch((err) => console.log("❌ DB connection failed:", err.message));