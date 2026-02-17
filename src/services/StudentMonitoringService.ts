export interface StudentActivity {
  studentId: string;
  timestamp: Date;
  type: 'tab_switch' | 'camera_off' | 'camera_on' | 'mic_off' | 'mic_on' | 'speaking' | 'silent' | 'disconnected' | 'reconnected' | 'login' | 'logout' | 'exam_start' | 'exam_submit' | 'question_answer' | 'question_skip' | 'warning_received';
  details?: string;
  severity: 'low' | 'medium' | 'high';
  metadata?: any; // Additional data like exam scores, question details, etc.
}

export interface StudentStatus {
  id: string;
  name: string;
  enrollmentNo: string;
  isOnline: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  isSpeaking: boolean;
  isTabActive: boolean;
  lastActivity: Date;
  examStartTime: Date | null;
  warnings: number;
  currentTab: string;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  loginTime: Date;
  isInExam: boolean;
  examHistory: ExamRecord[];
  currentExam: ExamRecord | null;
  totalExamsTaken: number;
  averageScore: number;
  lastExamDate: Date | null;
  lastExamScore: number | null;
  totalTimeSpent: number; // Total time spent in exams (in seconds)
  activityCount: number; // Total number of activities logged
}

export interface ExamRecord {
  examId: string;
  examDate: Date;
  examDuration: number; // in seconds
  totalQuestions: number;
  questionsAttempted: number;
  questionsAnswered: number;
  questionsSkipped: number;
  score: number | null;
  status: 'completed' | 'in_progress' | 'abandoned';
  categories: CategoryPerformance[];
}

export interface CategoryPerformance {
  category: string;
  attempted: number;
  answered: number;
  skipped: number;
  score: number;
}

export interface StudentSnapshot {
  id: string;
  studentId: string;
  timestamp: Date;
  imageData: string; // Base64 encoded image
  studentName: string;
  enrollmentNo: string;
}

class StudentMonitoringService {
  private students: Map<string, StudentStatus> = new Map();
  private snapshots: Map<string, StudentSnapshot[]> = new Map();
  private activityCallbacks: ((activity: StudentActivity) => void)[] = [];
  private statusCallbacks: ((status: StudentStatus[]) => void)[] = [];
  private snapshotCallbacks: ((snapshots: StudentSnapshot[]) => void)[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private tabVisibilityHandler: (() => void) | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private audioStream: MediaStream | null = null;

  constructor() {
    this.startMonitoring();
    // Seed demo students when running on localhost for development/demo purposes
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      if ((hostname === 'localhost' || hostname === '127.0.0.1') && this.students.size === 0) {
        this.seedDemoStudents();
      }
    } catch (err) {
      // ignore in non-browser environments
    }
  }

  private seedDemoStudents() {
    // Create three demo students with varying states
    const id1 = this.addStudent('ENR001', 'Aarav Sharma', 'demo');
    const id2 = this.addStudent('ENR002', 'Priya Kapoor', 'demo');
    const id3 = this.addStudent('ENR003', 'Rohit Patel', 'demo');

    // Update statuses to show different dashboard panels
    this.updateStudentStatus(id1, {
      isCameraOn: true,
      isMicOn: true,
      isInExam: true,
      examStartTime: new Date(Date.now() - 5 * 60 * 1000), // started 5 minutes ago
      currentExam: {
        examId: 'demo_exam_1',
        examDate: new Date(),
        examDuration: 0,
        totalQuestions: 20,
        questionsAttempted: 3,
        questionsAnswered: 3,
        questionsSkipped: 0,
        score: null,
        status: 'in_progress',
        categories: []
      },
      connectionQuality: 'good'
    });

    this.updateStudentStatus(id2, {
      isCameraOn: false,
      isMicOn: true,
      isInExam: false,
      connectionQuality: 'excellent'
    });

    this.updateStudentStatus(id3, {
      isCameraOn: true,
      isMicOn: false,
      isInExam: false,
      connectionQuality: 'poor'
    });

    this.notifyStatusUpdate();
  }

  public startMonitoring() {
    // Monitor tab visibility changes
    this.tabVisibilityHandler = () => {
      const isVisible = !document.hidden;
      this.updateTabActivity(isVisible);
    };
    document.addEventListener('visibilitychange', this.tabVisibilityHandler);

    // Start periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.simulateStudentActivities();
      this.notifyStatusUpdate();
    }, 3000);
  }

  public stopMonitoring() {
    if (this.tabVisibilityHandler) {
      document.removeEventListener('visibilitychange', this.tabVisibilityHandler);
    }
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.stopAudioMonitoring();
  }

  private updateTabActivity(isVisible: boolean) {
    // Simulate tab switching for demo purposes
    if (!isVisible) {
      this.recordActivity('1', 'tab_switch', 'Student switched to another tab', 'medium');
    }
  }

  private simulateStudentActivities() {
    this.students.forEach((student, studentId) => {
      // Only simulate activities for students who are online
      if (!student.isOnline) return;

      const random = Math.random();
      
      if (random > 0.95) {
        // 5% chance of camera turning off
        if (student.isCameraOn) {
          student.isCameraOn = false;
          this.recordActivity(studentId, 'camera_off', 'Camera turned off', 'high');
        }
      } else if (random > 0.9) {
        // 5% chance of camera turning on
        if (!student.isCameraOn && student.isOnline) {
          student.isCameraOn = true;
          this.recordActivity(studentId, 'camera_on', 'Camera turned on', 'low');
        }
      }

      if (random > 0.85) {
        // 15% chance of speaking
        student.isSpeaking = !student.isSpeaking;
        this.recordActivity(
          studentId, 
          student.isSpeaking ? 'speaking' : 'silent',
          student.isSpeaking ? 'Student started speaking' : 'Student stopped speaking',
          'low'
        );
      }

      if (random > 0.8) {
        // 20% chance of tab switching
        student.isTabActive = !student.isTabActive;
        if (!student.isTabActive) {
          this.recordActivity(studentId, 'tab_switch', 'Student switched to another tab', 'medium');
        }
      }

      // Update last activity
      student.lastActivity = new Date();
    });
  }

  // Add new student when they login
  public addStudent(enrollmentNo: string, name: string, password: string): string {
    const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newStudent: StudentStatus = {
      id: studentId,
      name: name,
      enrollmentNo: enrollmentNo,
      isOnline: true,
      isCameraOn: false,
      isMicOn: false,
      isSpeaking: false,
      isTabActive: true,
      lastActivity: new Date(),
      examStartTime: null,
      warnings: 0,
      currentTab: 'Dashboard',
      connectionQuality: 'excellent',
      loginTime: new Date(),
      isInExam: false,
      examHistory: [],
      currentExam: null,
      totalExamsTaken: 0,
      averageScore: 0,
      lastExamDate: null,
      lastExamScore: null,
      totalTimeSpent: 0,
      activityCount: 0
    };

    this.students.set(studentId, newStudent);
    
    // Record login activity
    this.recordActivity(studentId, 'login', `Student ${name} (${enrollmentNo}) logged in`, 'low');
    
    // Notify status update
    this.notifyStatusUpdate();
    
    return studentId;
  }

  // Remove student when they logout
  public removeStudent(studentId: string) {
    const student = this.students.get(studentId);
    if (student) {
      this.recordActivity(studentId, 'logout', `Student ${student.name} (${student.enrollmentNo}) logged out`, 'low');
      this.students.delete(studentId);
      this.notifyStatusUpdate();
    }
  }

  // Update student exam status
  public updateStudentExamStatus(studentId: string, isInExam: boolean, examStartTime?: Date) {
    const student = this.students.get(studentId);
    if (student) {
      student.isInExam = isInExam;
      if (examStartTime) {
        student.examStartTime = examStartTime;
        this.recordActivity(studentId, 'exam_start', `Student ${student.name} started an exam`, 'medium', { examStartTime });
      }
      student.currentTab = isInExam ? 'Exam Page' : 'Dashboard';
      this.notifyStatusUpdate();
    }
  }

  // Record exam completion
  public recordExamCompletion(studentId: string, examData: {
    examId: string;
    duration: number;
    totalQuestions: number;
    questionsAttempted: number;
    questionsAnswered: number;
    questionsSkipped: number;
    score: number;
    categories: CategoryPerformance[];
  }) {
    const student = this.students.get(studentId);
    if (student) {
      const examRecord: ExamRecord = {
        examId: examData.examId,
        examDate: new Date(),
        examDuration: examData.duration,
        totalQuestions: examData.totalQuestions,
        questionsAttempted: examData.questionsAttempted,
        questionsAnswered: examData.questionsAnswered,
        questionsSkipped: examData.questionsSkipped,
        score: examData.score,
        status: 'completed',
        categories: examData.categories
      };

      // Add to exam history
      student.examHistory.push(examRecord);
      student.totalExamsTaken += 1;
      student.lastExamDate = examRecord.examDate;
      student.lastExamScore = examRecord.score;
      student.totalTimeSpent += examData.duration;

      // Calculate new average score
      const totalScore = student.examHistory.reduce((sum, exam) => sum + (exam.score || 0), 0);
      student.averageScore = totalScore / student.examHistory.length;

      // Clear current exam
      student.currentExam = null;
      student.isInExam = false;
      student.examStartTime = null;

      this.recordActivity(
        studentId, 
        'exam_submit', 
        `Student ${student.name} completed exam with score ${examData.score}%`, 
        'medium',
        { examRecord }
      );

      this.notifyStatusUpdate();
    }
  }

  // Record question activity
  public recordQuestionActivity(studentId: string, type: 'question_answer' | 'question_skip', questionId: number, details: string) {
    const student = this.students.get(studentId);
    if (student) {
      this.recordActivity(
        studentId,
        type,
        details,
        'low',
        { questionId, timestamp: new Date() }
      );
      student.activityCount += 1;
    }
  }

  // Find student by enrollment number
  public findStudentByEnrollment(enrollmentNo: string): StudentStatus | undefined {
    return Array.from(this.students.values()).find(student => 
      student.enrollmentNo === enrollmentNo
    );
  }

  public async startAudioMonitoring(studentId: string): Promise<boolean> {
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(this.audioStream);
      
      this.microphone.connect(this.analyser);
      this.analyser.fftSize = 256;
      
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioLevel = () => {
        if (this.analyser) {
          this.analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          
          // Update student speaking status based on audio level
          const student = this.students.get(studentId);
          if (student && average > 30) { // Threshold for speaking detection
            if (!student.isSpeaking) {
              student.isSpeaking = true;
              this.recordActivity(studentId, 'speaking', 'Student started speaking', 'low');
            }
          } else if (student && student.isSpeaking) {
            student.isSpeaking = false;
            this.recordActivity(studentId, 'silent', 'Student stopped speaking', 'low');
          }
        }
        requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
      return true;
    } catch (error) {
      console.error('Error starting audio monitoring:', error);
      return false;
    }
  }

  public stopAudioMonitoring() {
    if (this.microphone) {
      this.microphone.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
    }
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.audioStream = null;
  }

  public recordActivity(studentId: string, type: StudentActivity['type'], details: string, severity: StudentActivity['severity'], metadata?: any) {
    const activity: StudentActivity = {
      studentId,
      timestamp: new Date(),
      type,
      details,
      severity,
      metadata
    };

    // Update student status
    const student = this.students.get(studentId);
    if (student) {
      if (severity === 'high') {
        student.warnings += 1;
      }
      student.lastActivity = new Date();
      student.activityCount += 1;
    }

    // Notify activity callbacks
    this.activityCallbacks.forEach(callback => callback(activity));
  }

  public getStudentStatus(studentId: string): StudentStatus | undefined {
    return this.students.get(studentId);
  }

  public getAllStudentStatuses(): StudentStatus[] {
    return Array.from(this.students.values());
  }

  public updateStudentStatus(studentId: string, updates: Partial<StudentStatus>) {
    const student = this.students.get(studentId);
    if (student) {
      Object.assign(student, updates);
      student.lastActivity = new Date();
      this.notifyStatusUpdate();
    }
  }

  public sendWarning(studentId: string) {
    const student = this.students.get(studentId);
    if (student) {
      student.warnings += 1;
      this.recordActivity(studentId, 'warning_received', 'Warning sent by admin', 'medium');
      
      // Auto-disconnect on 3 warnings
      if (student.warnings >= 3) {
        this.recordActivity(studentId, 'disconnected', 'Student disconnected due to 3 warnings', 'high');
        student.isOnline = false;
        student.isCameraOn = false;
        student.isMicOn = false;
        student.isTabActive = false;
        student.connectionQuality = 'disconnected';
        student.isInExam = false;
        student.examStartTime = null;
      }
      
      this.notifyStatusUpdate();
    }
  }

  public onActivity(callback: (activity: StudentActivity) => void) {
    this.activityCallbacks.push(callback);
    return () => {
      const index = this.activityCallbacks.indexOf(callback);
      if (index > -1) {
        this.activityCallbacks.splice(index, 1);
      }
    };
  }

  public onStatusUpdate(callback: (status: StudentStatus[]) => void) {
    this.statusCallbacks.push(callback);
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  private notifyStatusUpdate() {
    const statuses = this.getAllStudentStatuses();
    this.statusCallbacks.forEach(callback => callback(statuses));
  }

  public disconnectStudent(studentId: string) {
    const student = this.students.get(studentId);
    if (student) {
      student.isOnline = false;
      student.isCameraOn = false;
      student.isMicOn = false;
      student.isTabActive = false;
      student.connectionQuality = 'disconnected';
      this.recordActivity(studentId, 'disconnected', 'Student disconnected', 'high');
      this.notifyStatusUpdate();
    }
  }

  public reconnectStudent(studentId: string) {
    const student = this.students.get(studentId);
    if (student) {
      student.isOnline = true;
      student.isCameraOn = true;
      student.isMicOn = true;
      student.isTabActive = true;
      student.connectionQuality = 'good';
      this.recordActivity(studentId, 'reconnected', 'Student reconnected', 'low');
      this.notifyStatusUpdate();
    }
  }

  // Get students who are currently in exam
  public getStudentsInExam(): StudentStatus[] {
    return Array.from(this.students.values()).filter(student => student.isInExam);
  }

  // Get students who are online but not in exam
  public getStudentsOnline(): StudentStatus[] {
    return Array.from(this.students.values()).filter(student => student.isOnline && !student.isInExam);
  }

  // Get total count of students
  public getTotalStudentCount(): number {
    return this.students.size;
  }

  // Get count of students in exam
  public getStudentsInExamCount(): number {
    return this.getStudentsInExam().length;
  }

  // Get student exam statistics
  public getStudentExamStats(studentId: string) {
    const student = this.students.get(studentId);
    if (!student) return null;

    return {
      totalExams: student.totalExamsTaken,
      averageScore: student.averageScore,
      lastExamScore: student.lastExamScore,
      lastExamDate: student.lastExamDate,
      totalTimeSpent: student.totalTimeSpent,
      examHistory: student.examHistory
    };
  }

  // Get recent activities for a specific student
  public getStudentRecentActivities(studentId: string, limit: number = 10): StudentActivity[] {
    // This would be implemented to return recent activities for a specific student
    // For now, we'll return all activities and filter in the component
    return [];
  }

  // Capture snapshot from student's camera
  public async captureSnapshot(studentId: string): Promise<boolean> {
    try {
      const student = this.students.get(studentId);
      if (!student) return false;

      // Access camera stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });

      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to load
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      // Create canvas and draw video frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      ctx.drawImage(video, 0, 0);

      // Stop stream
      stream.getTracks().forEach(track => track.stop());

      // Convert canvas to base64 image
      const imageData = canvas.toDataURL('image/jpeg', 0.9);

      // Create snapshot object
      const snapshot: StudentSnapshot = {
        id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        timestamp: new Date(),
        imageData,
        studentName: student.name,
        enrollmentNo: student.enrollmentNo
      };

      // Store snapshot
      if (!this.snapshots.has(studentId)) {
        this.snapshots.set(studentId, []);
      }
      this.snapshots.get(studentId)!.push(snapshot);

      // Store in localStorage for persistence
      try {
        const storedSnapshots = JSON.parse(localStorage.getItem('studentSnapshots') || '{}');
        if (!storedSnapshots[studentId]) {
          storedSnapshots[studentId] = [];
        }
        storedSnapshots[studentId].push({
          ...snapshot,
          timestamp: snapshot.timestamp.toISOString()
        });
        localStorage.setItem('studentSnapshots', JSON.stringify(storedSnapshots));
      } catch (err) {
        console.error('Error storing snapshot in localStorage:', err);
      }

      // Notify snapshot callbacks
      this.notifySnapshotUpdate(studentId);

      return true;
    } catch (error) {
      console.error('Error capturing snapshot:', error);
      return false;
    }
  }

  // Get snapshots for a specific student
  public getStudentSnapshots(studentId: string): StudentSnapshot[] {
    const snapshots = this.snapshots.get(studentId);
    if (snapshots) {
      return snapshots;
    }

    // Try to load from localStorage if not in memory
    try {
      const storedSnapshots = JSON.parse(localStorage.getItem('studentSnapshots') || '{}');
      if (storedSnapshots[studentId]) {
        const loadedSnapshots = storedSnapshots[studentId].map((snap: any) => ({
          ...snap,
          timestamp: new Date(snap.timestamp)
        }));
        this.snapshots.set(studentId, loadedSnapshots);
        return loadedSnapshots;
      }
    } catch (err) {
      console.error('Error loading snapshots from localStorage:', err);
    }

    return [];
  }

  // Download snapshot
  public downloadSnapshot(snapshotId: string, studentId: string): void {
    const snapshots = this.snapshots.get(studentId) || [];
    const snapshot = snapshots.find(s => s.id === snapshotId);

    if (!snapshot) {
      alert('Snapshot not found');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = snapshot.imageData;
      link.download = `snapshot_${snapshot.studentName}_${snapshot.timestamp.toISOString().split('T')[0]}_${snapshot.timestamp.toLocaleTimeString().replace(/:/g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading snapshot:', error);
      alert('Error downloading snapshot');
    }
  }

  // Delete snapshot
  public deleteSnapshot(snapshotId: string, studentId: string): void {
    const snapshots = this.snapshots.get(studentId);
    if (snapshots) {
      const index = snapshots.findIndex(s => s.id === snapshotId);
      if (index > -1) {
        snapshots.splice(index, 1);
        
        // Update localStorage
        try {
          const storedSnapshots = JSON.parse(localStorage.getItem('studentSnapshots') || '{}');
          if (storedSnapshots[studentId]) {
            storedSnapshots[studentId] = storedSnapshots[studentId].filter((s: any) => s.id !== snapshotId);
            localStorage.setItem('studentSnapshots', JSON.stringify(storedSnapshots));
          }
        } catch (err) {
          console.error('Error updating localStorage:', err);
        }

        this.notifySnapshotUpdate(studentId);
      }
    }
  }

  public onSnapshotUpdate(callback: (snapshots: StudentSnapshot[]) => void) {
    this.snapshotCallbacks.push(callback);
    return () => {
      const index = this.snapshotCallbacks.indexOf(callback);
      if (index > -1) {
        this.snapshotCallbacks.splice(index, 1);
      }
    };
  }

  private notifySnapshotUpdate(studentId: string) {
    const snapshots = this.getStudentSnapshots(studentId);
    this.snapshotCallbacks.forEach(callback => callback(snapshots));
  }
}

// Export singleton instance
export const studentMonitoringService = new StudentMonitoringService();
