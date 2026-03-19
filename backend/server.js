import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import "dotenv/config";

// Database Connection
import pool from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// -------------------------
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

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Request logging for Hostinger debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// -------------------------
// API Routes (Prefix with /api)
// -------------------------

// Health Check
app.get("/api/health", async (req, res) => {
  try {
    const [result] = await pool.query("SELECT 1 as status");
    res.json({ 
      status: "online", 
      database: result[0].status === 1 ? "connected" : "error",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ 
      status: "online", 
      database: "disconnected", 
      error: err.message 
    });
  }
});

// Authentication Routes
app.use("/api", authRoutes);

// Admin Statistics
app.get("/api/admin/stats", async (req, res) => {
  try {
    const [studentCount] = await pool.query("SELECT COUNT(*) as count FROM students");
    const [examCount] = await pool.query("SELECT COUNT(*) as count FROM student_assessments");
    const [avgScore] = await pool.query("SELECT AVG(score) as avg FROM student_assessments WHERE status = 'completed'");
    
    res.json({
      totalStudents: studentCount[0].count,
      totalExams: examCount[0].count,
      averageScore: Math.round(avgScore[0].avg || 0)
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all students
app.get("/api/admin/students", async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT u.id, u.username, u.full_name as name, s.enrollment_no
      FROM users u
      JOIN students s ON u.id = s.user_id
      WHERE u.role = 'student'
    `);
    res.json(students);
  } catch (err) {
    console.error("Fetch students error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Proctoring Incident Route
app.post("/api/proctoring/incident", async (req, res) => {
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

// Get Questions for an Assessment
app.get("/api/assessments/:id/questions", async (req, res) => {
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

// ==========================================
// SERVE REACT FRONTEND
// We assume 'dist' folder is uploaded directly next to server.js on Hostinger
const distPath = path.join(__dirname, "dist");

app.use(express.static(distPath));

// Catch-all: serve React index.html for any non-API route (React Router support)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
