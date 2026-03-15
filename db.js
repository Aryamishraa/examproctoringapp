
import mysql from "mysql2/promise";
import "dotenv/config";

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "safeexaminers",
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create a pool for general use
export const pool = mysql.createPool(dbConfig);

// Helper for single connections (like in init-db.js)
export const createConnection = (configOverrides = {}) => {
  return mysql.createConnection({ ...dbConfig, ...configOverrides });
};

export default pool;
