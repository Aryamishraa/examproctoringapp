import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import AdminLogin from './components/AdminLogin';
import Dashboard from './components/Dashboard';
import ExamPage from './components/ExamPage';
import SubmittedPage from './components/SubmittedPage';
import AdminPage from './components/AdminPage';
import { examService, ExamProgress } from './services/ExamService';

export type PageType = 'login' | 'admin-login' | 'dashboard' | 'exam' | 'submitted' | 'admin';

export interface User {
  enrollmentNo: string;
  name: string;
  isAdmin?: boolean;
  studentId?: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('login');
  const [user, setUser] = useState<User | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [examProgress, setExamProgress] = useState<ExamProgress | null>(null);

  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    
    // Check if user is admin
    if (userData.isAdmin) {
      setCurrentPage('admin');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    // Remove student from monitoring service if they have a studentId
    if (user?.studentId) {
      // Import and use the monitoring service to remove the student
      import('./services/StudentMonitoringService').then(({ studentMonitoringService }) => {
        studentMonitoringService.removeStudent(user.studentId!);
      });
      
      // Clear exam progress
      examService.clearExamProgress(user.studentId);
    }
    
    setUser(null);
    setExamStarted(false);
    setExamProgress(null);
    setCurrentPage('login');
  };

  const switchToAdmin = () => {
    setCurrentPage('admin-login');
  };

  const switchToStudent = () => {
    setCurrentPage('login');
  };

  const startExam = () => {
    if (user?.studentId) {
      // Start exam tracking
      const progress = examService.startExam(user.studentId);
      setExamProgress(progress);
    }
    
    setExamStarted(true);
    setCurrentPage('exam');
    
    // Update student exam status in monitoring service
    if (user?.studentId) {
      import('./services/StudentMonitoringService').then(({ studentMonitoringService }) => {
        studentMonitoringService.updateStudentExamStatus(user.studentId!, true, new Date());
      });
    }
  };

  const submitExam = () => {
    let finalProgress: ExamProgress | null = null;
    
    // Submit exam and get final progress
    if (user?.studentId) {
      finalProgress = examService.submitExam(user.studentId);
      setExamProgress(finalProgress);
    }
    
    // Update student exam status in monitoring service
    if (user?.studentId) {
      import('./services/StudentMonitoringService').then(({ studentMonitoringService }) => {
        studentMonitoringService.updateStudentExamStatus(user.studentId!, false);
      });
    }
    
    setCurrentPage('submitted');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} onSwitchToAdmin={switchToAdmin} />;
      case 'admin-login':
        return <AdminLogin onLogin={handleLogin} onBackToStudent={switchToStudent} />;
      case 'dashboard':
        return <Dashboard user={user!} onStartExam={startExam} onLogout={handleLogout} />;
      case 'exam':
        return <ExamPage user={user!} onSubmitExam={submitExam} onLogout={handleLogout} />;
      case 'submitted':
        return <SubmittedPage user={user!} examProgress={examProgress} onLogout={handleLogout} />;
      case 'admin':
        return <AdminPage onLogout={handleLogout} />;
      default:
        return <LoginPage onLogin={handleLogin} onSwitchToAdmin={switchToAdmin} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentPage()}
    </div>
  );
}

export default App;