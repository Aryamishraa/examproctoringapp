import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentActivity extends Document {
  studentId: mongoose.Types.ObjectId;
  timestamp: Date;
  type: 'tab_switch' | 'camera_off' | 'camera_on' | 'mic_off' | 'mic_on' | 'speaking' | 'silent' | 'disconnected' | 'reconnected' | 'login' | 'logout' | 'exam_start' | 'exam_submit' | 'question_answer' | 'question_skip' | 'warning_received' | 'student_not_visible';
  details: string;
  severity: 'low' | 'medium' | 'high';
  metadata: any; // Additional data like exam scores, question details, etc.
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentActivitySchema = new Schema<IStudentActivity>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    required: true,
    enum: [
      'tab_switch', 'camera_off', 'camera_on', 'mic_off', 'mic_on', 
      'speaking', 'silent', 'disconnected', 'reconnected', 'login', 
      'logout', 'exam_start', 'exam_submit', 'question_answer', 
      'question_skip', 'warning_received', 'student_not_visible'
    ]
  },
  details: {
    type: String,
    required: true,
    trim: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  sessionId: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  collection: 'student_activities'
});

// Indexes for better performance
StudentActivitySchema.index({ studentId: 1 });
StudentActivitySchema.index({ timestamp: -1 });
StudentActivitySchema.index({ type: 1 });
StudentActivitySchema.index({ severity: 1 });
StudentActivitySchema.index({ createdAt: 1 });

// Compound indexes for common queries
StudentActivitySchema.index({ studentId: 1, timestamp: -1 });
StudentActivitySchema.index({ studentId: 1, type: 1 });
StudentActivitySchema.index({ severity: 1, timestamp: -1 });

// Virtual for activity age
StudentActivitySchema.virtual('ageInMinutes').get(function() {
  return Math.floor((Date.now() - this.timestamp.getTime()) / (1000 * 60));
});

// Virtual for activity age in hours
StudentActivitySchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.timestamp.getTime()) / (1000 * 60 * 60));
});

// Static method to get recent activities for a student
StudentActivitySchema.statics.getRecentActivities = function(studentId: string, limit: number = 50) {
  return this.find({ studentId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('studentId', 'name enrollmentNo');
};

// Static method to get high severity activities
StudentActivitySchema.statics.getHighSeverityActivities = function(limit: number = 100) {
  return this.find({ severity: 'high' })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('studentId', 'name enrollmentNo');
};

// Static method to get activities by type
StudentActivitySchema.statics.getActivitiesByType = function(type: string, limit: number = 100) {
  return this.find({ type })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('studentId', 'name enrollmentNo');
};

// Static method to get activities in time range
StudentActivitySchema.statics.getActivitiesInRange = function(startDate: Date, endDate: Date, limit: number = 1000) {
  return this.find({
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('studentId', 'name enrollmentNo');
};

// Method to update metadata
StudentActivitySchema.methods.updateMetadata = function(newMetadata: any) {
  this.metadata = { ...this.metadata, ...newMetadata };
  return this.save();
};

// Method to mark as reviewed
StudentActivitySchema.methods.markAsReviewed = function() {
  this.metadata.reviewed = true;
  this.metadata.reviewedAt = new Date();
  return this.save();
};

export const StudentActivity = mongoose.model<IStudentActivity>('StudentActivity', StudentActivitySchema);
export default StudentActivity;
