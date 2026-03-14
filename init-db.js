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
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'instructor', 'student') NOT NULL DEFAULT 'student',
      full_name VARCHAR(255) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ users table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      description TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ subjects table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS question_banks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subject_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ question_banks table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question_bank_id INT NOT NULL,
      question_text TEXT NOT NULL,
      question_type ENUM('mcq', 'true_false', 'descriptive') NOT NULL DEFAULT 'mcq',
      difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
      default_marks DECIMAL(5,2) DEFAULT 1.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_bank_id) REFERENCES question_banks(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ questions table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS options (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question_id INT NOT NULL,
      option_text TEXT NOT NULL,
      is_correct BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ options table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS assessments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subject_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT NULL,
      duration_minutes INT NOT NULL DEFAULT 60,
      passing_score DECIMAL(5,2) DEFAULT 40.00,
      total_marks DECIMAL(5,2) DEFAULT 100.00,
      is_active BOOLEAN DEFAULT TRUE,
      created_by INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ assessments table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS assessment_questions (
      assessment_id INT NOT NULL,
      question_id INT NOT NULL,
      order_no INT DEFAULT 0,
      PRIMARY KEY (assessment_id, question_id),
      FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ assessment_questions table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      enrollment_no VARCHAR(50) NOT NULL UNIQUE,
      is_online BOOLEAN DEFAULT FALSE,
      is_camera_on BOOLEAN DEFAULT FALSE,
      is_mic_on BOOLEAN DEFAULT FALSE,
      is_speaking BOOLEAN DEFAULT FALSE,
      is_tab_active BOOLEAN DEFAULT TRUE,
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
      warnings INT DEFAULT 0,
      current_tab VARCHAR(255) DEFAULT 'Dashboard',
      connection_quality ENUM('excellent', 'good', 'poor', 'disconnected') DEFAULT 'excellent',
      is_in_exam BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_enrollment (enrollment_no),
      INDEX idx_online (is_online),
      INDEX idx_in_exam (is_in_exam)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ students table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS biometrics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL UNIQUE,
      face_encoding LONGTEXT DEFAULT NULL,
      reference_image_path VARCHAR(500) DEFAULT NULL,
      last_verified DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ biometrics table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS exams (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      assessment_id INT NOT NULL,
      exam_start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      exam_end_time DATETIME DEFAULT NULL,
      questions_attempted INT DEFAULT 0,
      score DECIMAL(5,2) DEFAULT NULL,
      time_spent_seconds INT DEFAULT 0,
      status ENUM('in_progress', 'completed', 'abandoned', 'suspended') DEFAULT 'in_progress',
      warnings INT DEFAULT 0,
      proctoring_score DECIMAL(5,2) DEFAULT 100.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
      INDEX idx_student (student_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ exams table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS exam_answers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      exam_id INT NOT NULL,
      question_id INT NOT NULL,
      selected_option_id INT DEFAULT NULL,
      answer_text TEXT DEFAULT NULL,
      is_correct BOOLEAN DEFAULT FALSE,
      time_spent_seconds INT DEFAULT 0,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id),
      FOREIGN KEY (selected_option_id) REFERENCES options(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ exam_answers table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS proctoring_incidents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      exam_id INT NOT NULL,
      type ENUM('tab_switch', 'face_not_recognized', 'multiple_faces', 'phone_detected', 'voice_detected', 'eye_deviation', 'camera_off') NOT NULL,
      severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
      details TEXT DEFAULT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      snapshot_path VARCHAR(500) DEFAULT NULL,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ proctoring_incidents table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS recordings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      exam_id INT NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size BIGINT NOT NULL DEFAULT 0,
      duration_seconds INT DEFAULT 0,
      mime_type VARCHAR(100) DEFAULT 'video/webm',
      status ENUM('recording', 'completed', 'failed', 'deleted') DEFAULT 'recording',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ recordings table created");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS student_activities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      details TEXT DEFAULT NULL,
      ip_address VARCHAR(45) DEFAULT NULL,
      user_agent TEXT DEFAULT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("  ✅ student_activities table created");

  // Seed sample data
  console.log("\n👥 Seeding sample data...");

  const hash = await bcrypt.hash("password123", 10);
  
  // Seed Users
  await connection.query(
    `INSERT IGNORE INTO users (username, email, password_hash, role, full_name) VALUES
    ('admin', 'admin@example.com', ?, 'admin', 'Administrator'),
    ('instructor1', 'instr1@example.com', ?, 'instructor', 'Prof. Smith'),
    ('EN0001', 'john@example.com', ?, 'student', 'John Doe')`,
    [hash, hash, hash]
  );

  // Get user IDs
  const [userRows] = await connection.query("SELECT id, username FROM users");
  const users = Object.fromEntries(userRows.map(u => [u.username, u.id]));

  // Seed Student
  if (users['EN0001']) {
    await connection.query(
      `INSERT IGNORE INTO students (user_id, enrollment_no) VALUES (?, 'EN0001')`,
      [users['EN0001']]
    );
  }

  // Seed Subject
  await connection.query(
    `INSERT IGNORE INTO subjects (code, name, description) VALUES ('CS101', 'Computer Science 101', 'Intro to CS')`
  );

  // Get subject ID
  const [subjectRows] = await connection.query("SELECT id FROM subjects WHERE code = 'CS101'");
  const subjectId = subjectRows[0]?.id;

  if (subjectId && users['admin']) {
    // Seed Assessment
    const [assessmentRes] = await connection.query(
      `INSERT IGNORE INTO assessments (subject_id, title, duration_minutes, passing_score, total_marks, created_by)
       VALUES (?, 'Final Exam - CS101', 60, 40, 100, ?)`,
      [subjectId, users['admin']]
    );
    const assessmentId = assessmentRes.insertId || 1;

    // Seed Questions
    const [qbRes] = await connection.query(
      `INSERT IGNORE INTO question_banks (subject_id, name) VALUES (?, 'Core Concepts')`,
      [subjectId]
    );
    const qbId = qbRes.insertId || 1;

    const [qRes] = await connection.query(
      `INSERT IGNORE INTO questions (question_bank_id, question_text, question_type)
       VALUES (?, 'What is 2+2?', 'mcq')`,
      [qbId]
    );
    const qId = qRes.insertId || 1;

    await connection.query(
      `INSERT IGNORE INTO options (question_id, option_text, is_correct) VALUES (?, '4', 1), (?, '5', 0)`,
      [qId, qId]
    );

    await connection.query(
      `INSERT IGNORE INTO assessment_questions (assessment_id, question_id, order_no) VALUES (?, ?, 1)`,
      [assessmentId, qId]
    );

    // Seed Exam for Student
    const [studentRows] = await connection.query("SELECT id FROM students WHERE enrollment_no = 'EN0001'");
    const studentId = studentRows[0]?.id;

    if (studentId) {
      await connection.query(
        `INSERT IGNORE INTO exams (student_id, assessment_id, status) VALUES (?, ?, 'in_progress')`,
        [studentId, assessmentId]
      );
    }
  }

  console.log("  ✅ Sample data seeded");


  console.log("\n🎉 Database initialization completed!");

  await connection.end();
  console.log("🔌 Connection closed");
}

initDB().catch((err) => {
  console.error("❌ Initialization failed:", err);
  process.exit(1);
});
