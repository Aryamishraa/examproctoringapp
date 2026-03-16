import pool from "./config/db.js";

async function checkDB() {
  try {
    const [users] = await pool.query("SELECT id, username, email, role, full_name, password_hash FROM users");
    console.log("--- USERS ---");
    console.table(users);

    const [students] = await pool.query("SELECT * FROM students");
    console.log("--- STUDENTS ---");
    console.table(students);

    process.exit(0);
  } catch (err) {
    console.error("Error checking DB:", err);
    process.exit(1);
  }
}

checkDB();
