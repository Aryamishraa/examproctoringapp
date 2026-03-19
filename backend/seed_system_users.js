import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import "dotenv/config";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),
};

async function seed() {
  const pool = mysql.createPool(dbConfig);
  try {
    const salt = await bcrypt.genSalt(10);

    const users = [
      {
        username: "master_admin",
        email: "admin@atrealstudios.in",
        password: "AdminPassword@2026",
        role: "admin",
        full_name: "Master Administrator",
      },
      {
        username: "instructor_01",
        email: "instructor01@atrealstudios.in",
        password: "InstructorPassword@2026",
        role: "instructor",
        full_name: "Instructor 01",
      },
      {
        username: "STU-001",
        email: "stu001@atrealstudios.in",
        password: "StudentPassword@2026",
        role: "student",
        full_name: "Sample Student",
      },
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      // Check if user already exists
      const [existing] = await pool.query("SELECT id FROM users WHERE username = ?", [user.username]);
      
      if (existing.length === 0) {
        const [result] = await pool.query(
          "INSERT INTO users (username, email, password_hash, role, full_name) VALUES (?, ?, ?, ?, ?)",
          [user.username, user.email, hashedPassword, user.role, user.full_name]
        );
        
        console.log(`Created user: ${user.username} (${user.role})`);
        
        // If student, also add to students table
        if (user.role === "student") {
          await pool.query(
            "INSERT INTO students (user_id, enrollment_no) VALUES (?, ?)",
            [result.insertId, user.username]
          );
          console.log(`Created student record for: ${user.username}`);
        }
      } else {
        console.log(`User ${user.username} already exists, skipping...`);
      }
    }

    console.log("Seeding complete! ✅");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
