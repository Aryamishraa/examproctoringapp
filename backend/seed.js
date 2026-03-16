import bcrypt from "bcryptjs";
import pool from "./config/db.js";

async function seed() {
  try {
    console.log("Seeding database...");

    // 1. Create Student User (STU-001 / StudentPassword@2026)
    const enrollmentNo = "STU-001";
    const name = "Sample Student";
    const password = "StudentPassword@2026";
    const email = "stu001@example.com";
    
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Check if user exists
    const [existingUsers] = await pool.query("SELECT id FROM users WHERE username = ?", [enrollmentNo]);
    
    let userId;
    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log(`User ${enrollmentNo} already exists, updating password...`);
      await pool.query("UPDATE users SET password_hash = ?, full_name = ? WHERE id = ?", [passwordHash, name, userId]);
    } else {
      const [userResult] = await pool.query(
        "INSERT INTO users (username, email, password_hash, role, full_name) VALUES (?, ?, ?, 'student', ?)",
        [enrollmentNo, email, passwordHash, name]
      );
      userId = userResult.insertId;
      console.log(`Created user ${enrollmentNo} with ID ${userId}`);
    }

    // Check if student record exists
    const [existingStudents] = await pool.query("SELECT id FROM students WHERE user_id = ?", [userId]);
    if (existingStudents.length === 0) {
      await pool.query(
        "INSERT INTO students (user_id, enrollment_no, is_online, last_activity) VALUES (?, ?, FALSE, NOW())",
        [userId, enrollmentNo]
      );
      console.log(`Created student record for ${enrollmentNo}`);
    } else {
      console.log(`Student record for ${enrollmentNo} already exists.`);
    }

    console.log("Seeding complete! ✅");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
