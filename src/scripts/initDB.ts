import { connectDB, disconnectDB } from '../config/database.js';
import { mongoDBService } from '../services/MongoDBService.js';
import Student from '../models/Student.js';
import Exam from '../models/Exam.js';
import StudentActivity from '../models/StudentActivity.js';
import Recording from '../models/Recording.js';

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing MongoDB database...');
    
    // Connect to MongoDB
    await connectDB();
    
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Student.deleteMany({});
    await Exam.deleteMany({});
    await StudentActivity.deleteMany({});
    await Recording.deleteMany({});
    
    console.log('✅ Existing data cleared');
    
    // Create sample students
    console.log('👥 Creating sample students...');
    const student1 = await mongoDBService.createStudent('EN001', 'John Doe', 'password123');
    const student2 = await mongoDBService.createStudent('EN002', 'Jane Smith', 'password123');
    const student3 = await mongoDBService.createStudent('EN003', 'Mike Johnson', 'password123');
    
    console.log('✅ Sample students created');
    
    // Create sample activities
    console.log('📝 Creating sample activities...');
    await mongoDBService.logActivity(
      student1._id.toString(),
      'login',
      'Student John Doe logged in',
      'low'
    );
    
    await mongoDBService.logActivity(
      student2._id.toString(),
      'login',
      'Student Jane Smith logged in',
      'low'
    );
    
    await mongoDBService.logActivity(
      student3._id.toString(),
      'login',
      'Student Mike Johnson logged in',
      'low'
    );
    
    console.log('✅ Sample activities created');
    
    // Create sample exams
    console.log('📚 Creating sample exams...');
    const exam1 = await mongoDBService.createExam(student1._id.toString());
    const exam2 = await mongoDBService.createExam(student2._id.toString());
    
    // Update some answers for sample data
    await mongoDBService.updateExamAnswer(exam1._id.toString(), 1, 'A');
    await mongoDBService.updateExamAnswer(exam1._id.toString(), 2, 'B');
    await mongoDBService.updateExamAnswer(exam1._id.toString(), 3, 'C');
    await mongoDBService.updateExamAnswer(exam1._id.toString(), 4, 'D');
    await mongoDBService.updateExamAnswer(exam1._id.toString(), 5, 'A');
    
    await mongoDBService.updateExamAnswer(exam2._id.toString(), 1, 'B');
    await mongoDBService.updateExamAnswer(exam2._id.toString(), 2, 'A');
    await mongoDBService.updateExamAnswer(exam2._id.toString(), 3, 'D');
    
    // Complete exams
    await mongoDBService.completeExam(exam1._id.toString());
    await mongoDBService.completeExam(exam2._id.toString());
    
    console.log('✅ Sample exams created');
    
    // Create sample recordings
    console.log('🎥 Creating sample recordings...');
    await mongoDBService.createRecording(
      student1._id.toString(),
      exam1._id.toString(),
      'exam_recording_1.webm',
      '/recordings/exam_recording_1.webm',
      1024 * 1024 * 50, // 50MB
      'video/webm'
    );
    
    await mongoDBService.createRecording(
      student2._id.toString(),
      exam2._id.toString(),
      'exam_recording_2.webm',
      '/recordings/exam_recording_2.webm',
      1024 * 1024 * 45, // 45MB
      'video/webm'
    );
    
    console.log('✅ Sample recordings created');
    
    // Update student statistics
    console.log('📊 Updating student statistics...');
    await mongoDBService.updateStudentStatus(student1._id.toString(), {
      totalExamsTaken: 1,
      averageScore: 80,
      lastExamScore: 80,
      lastExamDate: new Date(),
      totalTimeSpent: 3600 // 1 hour
    });
    
    await mongoDBService.updateStudentStatus(student2._id.toString(), {
      totalExamsTaken: 1,
      averageScore: 75,
      lastExamScore: 75,
      lastExamDate: new Date(),
      totalTimeSpent: 3300 // 55 minutes
    });
    
    console.log('✅ Student statistics updated');
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log(`   👥 Students: 3`);
    console.log(`   📚 Exams: 2`);
    console.log(`   📝 Activities: 3`);
    console.log(`   🎥 Recordings: 2`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await disconnectDB();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };
