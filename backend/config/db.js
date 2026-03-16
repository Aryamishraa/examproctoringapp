import mysql from "mysql2/promise";
import "dotenv/config";

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "u376527475_examproctoring",
  password: process.env.DB_PASSWORD || "Adarsh@171",
  database: process.env.DB_NAME || "u376527475_exam_db",
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const pool = mysql.createPool(dbConfig);

export const createConnection = (configOverrides = {}) => {
  return mysql.createConnection({ ...dbConfig, ...configOverrides });
};

export default pool;
