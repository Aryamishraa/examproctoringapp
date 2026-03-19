import bcrypt from "bcryptjs";
import pool from "../config/db.js";

export const login = async (req, res) => {
  try {
    const { username, enrollmentNo, password } = req.body;
    const identifier = username || enrollmentNo;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Username/Enrollment and password are required" });
    }

    // Find user in users table
    const [userRows] = await pool.query(
      "SELECT id, username, full_name, password_hash, role FROM users WHERE username = ?",
      [identifier]
    );

    if (userRows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userData = userRows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, userData.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    let studentInfo = null;
    if (userData.role === 'student') {
      const [studentRows] = await pool.query(
        "SELECT id FROM students WHERE user_id = ?",
        [userData.id]
      );
      if (studentRows.length > 0) {
        studentInfo = {
          student_id: studentRows[0].id
        };
        
        // Update online status for students
        await pool.query(
          "UPDATE students SET is_online = TRUE, last_activity = NOW() WHERE id = ?",
          [studentRows[0].id]
        );
      }
    }

    res.status(200).json({
      message: "Login Success ✅",
      user: {
        id: userData.id,
        username: userData.username,
        name: userData.full_name,
        role: userData.role,
        isAdmin: userData.role === 'admin',
        studentId: studentInfo?.student_id
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
