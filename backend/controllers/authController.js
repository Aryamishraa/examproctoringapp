import bcrypt from "bcryptjs";
import pool from "../config/db.js";

export const login = async (req, res) => {
  try {
    const { enrollmentNo, name, password } = req.body;

    if (!enrollmentNo || !name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

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

    if (studentData.full_name !== name) {
      return res.status(401).json({ message: "Name does not match enrollment record" });
    }

    const isMatch = await bcrypt.compare(password, studentData.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    await pool.query(
      "UPDATE students SET is_online = TRUE, last_activity = NOW() WHERE id = ?",
      [studentData.student_id]
    );

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
};

export const register = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { enrollmentNo, name, password, email } = req.body;

    if (!enrollmentNo || !name || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    await connection.beginTransaction();

    const [existing] = await connection.query(
      "SELECT id FROM students WHERE enrollment_no = ?",
      [enrollmentNo]
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Student already exists" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const [userResult] = await connection.query(
      `INSERT INTO users (username, email, password_hash, role, full_name)
       VALUES (?, ?, ?, 'student', ?)`,
      [enrollmentNo, email || `${enrollmentNo}@example.com`, passwordHash, name]
    );

    const userId = userResult.insertId;

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
};
