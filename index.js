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

    // Join students with users to get authentication details
    const [rows] = await pool.query(
      `SELECT s.id as student_id, s.enrollment_no, u.full_name, u.password_hash, u.id as user_id 
       FROM students s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.enrollment_no = ?`,
      [enrollmentNo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid enrollment number" });
    }

    const studentData = rows[0];

    // Check if full_name matches (as per original logic, though usually username/email is enough)
    if (studentData.full_name !== name) {
      return res.status(401).json({ message: "Name does not match enrollment record" });
    }

    // Compare provided password with hash
    const isMatch = await bcrypt.compare(password, studentData.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Update online status and activity
    await pool.query(
      "UPDATE students SET is_online = TRUE, last_activity = NOW() WHERE id = ?",
      [studentData.student_id]
    );

    // Success - return student info
    res.status(200).json({
      message: "Login Success ✅",
      student: {
        _id: studentData.student_id,
        enrollmentNo: studentData.enrollment_no,
        name: studentData.full_name,
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
  const connection = await pool.getConnection();
  try {
    const { enrollmentNo, name, password, email } = req.body;

    if (!enrollmentNo || !name || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    await connection.beginTransaction();

    // Check if user/student exists
    const [existing] = await connection.query(
      "SELECT id FROM students WHERE enrollment_no = ?",
      [enrollmentNo]
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Student already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 1. Create User
    const [userResult] = await connection.query(
      `INSERT INTO users (username, email, password_hash, role, full_name)
       VALUES (?, ?, ?, 'student', ?)`,
      [enrollmentNo, email || `${enrollmentNo}@example.com`, passwordHash, name]
    );

    const userId = userResult.insertId;

    // 2. Create Student
    const [studentResult] = await connection.query(
      `INSERT INTO students (user_id, enrollment_no, is_online, last_activity)
       VALUES (?, ?, FALSE, NOW())`,
      [userId, enrollmentNo]
    );

    await connection.commit();

    res.status(201).json({
      message: "Student created ✅",
      studentId: studentResult.insertId,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    connection.release();
  }
});

// -------------------------
// Proctoring Incident Route
app.post("/proctoring/incident", async (req, res) => {
  try {
    const { examId, type, severity, details, snapshotPath } = req.body;

    if (!examId || !type) {
      return res.status(400).json({ message: "examId and type are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO proctoring_incidents (exam_id, type, severity, details, snapshot_path)
       VALUES (?, ?, ?, ?, ?)`,
      [examId, type, severity || 'low', details, snapshotPath]
    );

    res.status(201).json({
      message: "Incident logged ✅",
      incidentId: result.insertId,
    });
  } catch (err) {
    console.error("Proctoring error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------
// Get Questions for an Assessment
app.get("/assessments/:id/questions", async (req, res) => {
  try {
    const assessmentId = req.params.id;

    const [questions] = await pool.query(
      `SELECT q.id, q.question_text, q.question_type, q.difficulty, q.default_marks
       FROM questions q
       JOIN assessment_questions aq ON q.id = aq.question_id
       WHERE aq.assessment_id = ?
       ORDER BY aq.order_no`,
      [assessmentId]
    );

    // For each MCQ, get options
    for (let q of questions) {
      if (q.question_type === 'mcq') {
        const [options] = await pool.query(
          "SELECT id, option_text FROM options WHERE question_id = ?",
          [q.id]
        );
        q.options = options;
      }
    }

    res.status(200).json(questions);
  } catch (err) {
    console.error("Fetch questions error:", err);
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
