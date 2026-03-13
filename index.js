// index.js — SafeExaminers Backend (MySQL version)
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// -------------------------
// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "safeexaminers",
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test DB connection on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("MySQL Connected ✅");
    conn.release();
  } catch (err) {
    console.error("MySQL connection error:", err.message);
  }
})();

// -------------------------
// Middleware
app.use(cors({
  origin: "*"
}));
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "dist")));

// -------------------------
// Root route
app.get("/", (req, res) => {
  res.send("Backend Running ✅ (MySQL)");
});

// -------------------------
// Login Route
app.post("/login", async (req, res) => {
  try {
    const { enrollmentNo, name, password } = req.body;

    if (!enrollmentNo || !name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find student by enrollmentNo
    const [rows] = await pool.query(
      "SELECT * FROM students WHERE enrollment_no = ?",
      [enrollmentNo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const student = rows[0];

    // Check if name matches
    if (student.name !== name) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare provided password with hash
    const isMatch = await bcrypt.compare(password, student.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update online status
    await pool.query(
      "UPDATE students SET is_online = TRUE, login_time = NOW(), last_activity = NOW() WHERE id = ?",
      [student.id]
    );

    // Success - return student info
    res.status(200).json({
      message: "Login Success ✅",
      student: {
        _id: student.id,
        enrollmentNo: student.enrollment_no,
        name: student.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------
// Register Route
app.post("/register", async (req, res) => {
  try {
    const { enrollmentNo, name, password } = req.body;

    if (!enrollmentNo || !name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if student exists
    const [existing] = await pool.query(
      "SELECT id FROM students WHERE enrollment_no = ?",
      [enrollmentNo]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Student already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new student
    const [result] = await pool.query(
      `INSERT INTO students (enrollment_no, name, password_hash, is_online, login_time, last_activity)
       VALUES (?, ?, ?, FALSE, NULL, NOW())`,
      [enrollmentNo, name, passwordHash]
    );

    res.status(201).json({
      message: "Student created ✅",
      studentId: result.insertId,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// -------------------------
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});