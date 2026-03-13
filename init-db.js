// init-db.js — Create all tables and seed sample data for SafeExaminers
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function initDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    port: parseInt(process.env.DB_PORT || "3306"),
    multipleStatements: true,
  });

  console.log("✅ Connected to MySQL");

  // Create database
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || "safeexaminers"}\``
  );
  await connection.query(`USE \`${process.env.DB_NAME || "safeexaminers"}\``);
  console.log("✅ Database selected");

  // Create tables
  console.log("🔨 Creating tables...");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      enrollment_no VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      is_online BOOLEAN DEFAULT FALSE,
      is_camera_on BOOLEAN DEFAULT FALSE,
      is_mic_on BOOLEAN DEFAULT FALSE,
      is_speaking BOOLEAN DEFAULT FALSE,
      is_tab_active BOOLEAN DEFAULT TRUE,
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
      exam_start_time DATETIME DEFAULT NULL,
      warnings INT DEFAULT 0,
      current_tab VARCHAR(255) DEFAULT 'Dashboard',
      connection_quality ENUM('excellent', 'good', 'poor', 'disconnected') DEFAULT 'excellent',
      login_time DATETIME DEFAULT NULL,
      is_in_exam BOOLEAN DEFAULT FALSE,
      total_exams_taken INT DEFAULT 0,
      average_score DECIMAL(5,2) DEFAULT 0,
      last_exam_date DATETIME DEFAULT NULL,
      last_exam_score DECIMAL(5,2) DEFAULT NULL,
      total_time_spent INT DEFAULT 0,
      activity_count INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_enrollment (enrollment_no),
      INDEX idx_online (is_online),
      INDEX idx_in_exam (is_in_exam),
      INDEX idx_last_activity (last_activity)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ students table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS exams (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      exam_start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      exam_end_time DATETIME DEFAULT NULL,
      total_questions INT DEFAULT 70,
      questions_attempted INT DEFAULT 0,
      questions_answered INT DEFAULT 0,
      questions_skipped INT DEFAULT 0,
      score DECIMAL(5,2) DEFAULT NULL,
      time_spent INT DEFAULT 0,
      status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress',
      recording_path VARCHAR(500) DEFAULT NULL,
      recording_size BIGINT DEFAULT NULL,
      warnings INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      INDEX idx_student (student_id),
      INDEX idx_status (status),
      INDEX idx_start_time (exam_start_time),
      INDEX idx_score (score)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ exams table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS exam_answers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      exam_id INT NOT NULL,
      question_id INT NOT NULL,
      selected_answer VARCHAR(10) DEFAULT NULL,
      is_answered BOOLEAN DEFAULT FALSE,
      is_skipped BOOLEAN DEFAULT FALSE,
      time_spent INT DEFAULT 0,
      category VARCHAR(100) NOT NULL,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
      INDEX idx_exam (exam_id),
      INDEX idx_question (question_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ exam_answers table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS student_activities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      type ENUM(
        'tab_switch', 'camera_off', 'camera_on', 'mic_off', 'mic_on',
        'speaking', 'silent', 'disconnected', 'reconnected', 'login',
        'logout', 'exam_start', 'exam_submit', 'question_answer',
        'question_skip', 'warning_received', 'student_not_visible'
      ) NOT NULL,
      details TEXT NOT NULL,
      severity ENUM('low', 'medium', 'high') DEFAULT 'low',
      metadata JSON DEFAULT NULL,
      ip_address VARCHAR(45) DEFAULT NULL,
      user_agent TEXT DEFAULT NULL,
      session_id VARCHAR(255) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      INDEX idx_student (student_id),
      INDEX idx_timestamp (timestamp),
      INDEX idx_type (type),
      INDEX idx_severity (severity),
      INDEX idx_student_timestamp (student_id, timestamp)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ student_activities table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS recordings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      exam_id INT DEFAULT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size BIGINT NOT NULL DEFAULT 0,
      duration INT DEFAULT 0,
      mime_type VARCHAR(100) DEFAULT 'video/webm',
      recording_start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      recording_end_time DATETIME DEFAULT NULL,
      status ENUM('recording', 'completed', 'failed', 'deleted') DEFAULT 'recording',
      metadata JSON DEFAULT NULL,
      tags JSON DEFAULT NULL,
      is_public BOOLEAN DEFAULT FALSE,
      download_count INT DEFAULT 0,
      last_downloaded DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE SET NULL,
      INDEX idx_student (student_id),
      INDEX idx_exam (exam_id),
      INDEX idx_status (status),
      INDEX idx_start_time (recording_start_time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ recordings table created");

  // Seed sample data
  console.log("\n👥 Seeding sample students...");

  const students = [
    { enrollmentNo: "ENR004", name: "Riya Mishra", password: "122007" },
  ];

  for (const s of students) {
    const hash = await bcrypt.hash(s.password, 10);
    await connection.query(
      `INSERT IGNORE INTO students (enrollment_no, name, password_hash, is_online, login_time, last_activity)
       VALUES (?, ?, ?, FALSE, NOW(), NOW())`,
      [s.enrollmentNo, s.name, hash]
    );
  }
  console.log("  ✅ 3 sample students created");

  // Seed login activities
  console.log("📝 Seeding sample activities...");
  const [rows] = await connection.query("SELECT id, name, enrollment_no FROM students");
  for (const row of rows) {
    await connection.query(
      `INSERT INTO student_activities (student_id, type, details, severity)
       VALUES (?, 'login', ?, 'low')`,
      [row.id, `Student ${row.name} (${row.enrollment_no}) logged in`]
    );
  }
  console.log("  ✅ Sample activities created");

  console.log("\n🎉 Database initialization completed!");
  console.log("   👥 Students: 3");
  console.log("   📝 Activities: 3");

  await connection.end();
  console.log("🔌 Connection closed");
}

initDB().catch((err) => {
  console.error("❌ Initialization failed:", err);
  process.exit(1);
});
