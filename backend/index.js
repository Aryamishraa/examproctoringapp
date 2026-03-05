// index.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

// -------------------------
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("MongoDB connection error:", err));

// -------------------------
// Middleware
app.use(cors());
app.use(express.json());

// -------------------------
// Import Student model from frontend
// Since backend is JS and frontend is TS, define the schema here
const studentSchema = new mongoose.Schema({
  enrollmentNo: { type: String, required: true, unique: true, trim: true, minlength: 6 },
  name: { type: String, required: true, trim: true, minlength: 2 },
  passwordHash: { type: String, required: true },
  isOnline: { type: Boolean, default: false },
  isCameraOn: { type: Boolean, default: false },
  isMicOn: { type: Boolean, default: false },
  isSpeaking: { type: Boolean, default: false },
  isTabActive: { type: Boolean, default: true },
  lastActivity: { type: Date, default: Date.now },
  examStartTime: { type: Date, default: null },
  warnings: { type: Number, default: 0 },
  currentTab: { type: String, default: '' },
  connectionQuality: { type: String, enum: ['excellent', 'good', 'poor', 'disconnected'], default: 'disconnected' },
  loginTime: { type: Date, default: null },
  isInExam: { type: Boolean, default: false },
  totalExamsTaken: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  lastExamDate: { type: Date, default: null },
  lastExamScore: { type: Number, default: null },
  totalTimeSpent: { type: Number, default: 0 },
  activityCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Student = mongoose.model("Student", studentSchema);

// -------------------------
// Root route
app.get("/", (req, res) => {
  res.send("Backend Running ✅");
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
    const student = await Student.findOne({ enrollmentNo });
    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if name matches
    if (student.name !== name) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // compare provided password with hash
    const isMatch = await bcrypt.compare(password, student.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update online status
    student.isOnline = true;
    student.loginTime = new Date();
    student.lastActivity = new Date();
    await student.save();

    // Success - return student info
    res.status(200).json({
      message: "Login Success ✅",
      student: { _id: student._id, enrollmentNo: student.enrollmentNo, name: student.name }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------
// Register Route (Optional - for admin/guide to add students)
app.post("/register", async (req, res) => {
  try {
    const { enrollmentNo, name, password } = req.body;

    if (!enrollmentNo || !name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Student.findOne({ enrollmentNo });
    if (existing) return res.status(400).json({ message: "Student already exists" });

    // hash the password before saving
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newStudent = await Student.create({ enrollmentNo, name, passwordHash });
    res.status(201).json({ message: "Student created ✅", studentId: newStudent._id });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------
// Start server AFTER MongoDB connects
const startServer = () => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Connect and then start
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected, starting server...');
  startServer();
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection failed:', err);
  process.exit(1);
});