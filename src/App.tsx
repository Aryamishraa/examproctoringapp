import { useState, useEffect } from 'react';
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
  // Initialize state from localStorage if available
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    return (localStorage.getItem('currentPage') as PageType) || 'login';
  });
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [examProgress, setExamProgress] = useState<ExamProgress | null>(null);

  // Sync state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [currentPage, user]);


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
    // Comprehensive cleanup of monitoring and media tracks
    import('./services/StudentMonitoringService').then(({ studentMonitoringService }) => {
      studentMonitoringService.stopAllMonitoring();
    });

    if (user?.studentId) {
      // Clear exam progress in service
      examService.clearExamProgress(user.studentId);
    }
    
    // Clear local state and storage
    setUser(null);
    setExamProgress(null);
    setCurrentPage('login');
    localStorage.removeItem('user');
    localStorage.removeItem('currentPage');
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
    
    setCurrentPage('exam');
    
    // Update student exam status in monitoring service
    if (user?.studentId) {
      import('./services/StudentMonitoringService').then(({ studentMonitoringService }) => {
        studentMonitoringService.updateStudentExamStatus(user.studentId!, true, new Date());
        studentMonitoringService.startAudioMonitoring(user.studentId!).catch(err => {
          console.warn('Audio monitoring failed for student', user.studentId, err);
        });
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
    // Security Guard: Prevent non-admin from accessing admin page
    if (currentPage === 'admin' && (!user || !user.isAdmin)) {
      return <AdminLogin onLogin={handleLogin} onBackToStudent={switchToStudent} />;
    }

    // Security Guard: Prevent guest from accessing restricted student pages
    const restrictedStudentPages: PageType[] = ['dashboard', 'exam', 'submitted'];
    if (restrictedStudentPages.includes(currentPage) && !user) {
      return <LoginPage onLogin={handleLogin} onSwitchToAdmin={switchToAdmin} />;
    }

    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} onSwitchToAdmin={switchToAdmin} />;
      case 'admin-login':
        return <AdminLogin onLogin={handleLogin} onBackToStudent={switchToStudent} />;
      case 'dashboard':
        return user ? <Dashboard user={user} onStartExam={startExam} onLogout={handleLogout} /> : null;
      case 'exam':
        return user ? <ExamPage user={user} onSubmitExam={submitExam} onLogout={handleLogout} /> : null;
      case 'submitted':
        return user ? <SubmittedPage user={user} examProgress={examProgress} onLogout={handleLogout} /> : null;
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