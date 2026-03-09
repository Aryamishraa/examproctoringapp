import React from 'react';
import { LogOut, Calendar, Clock, AlertTriangle, Camera, Monitor, CheckCircle } from 'lucide-react';
import { User } from '../App';

interface DashboardProps {
  user: User;
  onStartExam: () => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onStartExam, onLogout }) => {
  const upcomingExams = [
    {
      id: 1,
      subject: 'Applied Mathematics',
      date: '2025-01-15',
      time: '10:00 AM',
      duration: '2 hours',
      status: 'Available'
    },
    {
      id: 2,
      subject: 'Computer Science Engineering',
      date: '2025-01-15',
      time: '2:00 PM',
      duration: '1.5 hours',
      status: 'Available'
    },
    {
      id: 3,
      subject: 'Science & Technology',
      date: '2025-01-16',
      time: '9:00 AM',
      duration: '2 hours',
      status: 'Upcoming'
    }
  ];

  const instructions = [
    {
      icon: <Camera className="h-5 w-5" />,
      title: 'Camera Must Be On',
      description: 'Your camera will be monitored throughout the exam for security purposes.'
    },
    {
      icon: <Monitor className="h-5 w-5" />,
      title: 'No Tab Switching',
      description: 'Switching tabs or minimizing the browser will result in exam termination.'
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: 'Attempt All Questions',
      description: 'Make sure to attempt all questions before submitting your exam.'
    }
  ];

  const warnings = [
    'Exam will be automatically terminated after 30 minutes of inactivity',
    'Red marks indicate questions not attempted',
    'Yellow marks show questions marked for review',
    'Green marks indicate attempted questions'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">SE</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Safe Examiner Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Exams */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Upcoming Exams
            </h2>
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{exam.subject}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-2 space-x-4">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {exam.date}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {exam.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Duration: {exam.duration}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        exam.status === 'Available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {exam.status}
                      </span>
                      {exam.status === 'Available' && exam.id === 2 && (
                        <button
                          onClick={onStartExam}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition duration-200"
                        >
                          Start Exam
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions & Warnings */}
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Exam Instructions</h2>
              <div className="space-y-4">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 text-blue-600 mt-0.5">
                      {instruction.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{instruction.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{instruction.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-red-800 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Important Warnings
              </h2>
              <div className="space-y-3">
                {warnings.map((warning, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-red-700">{warning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Legend */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Question Status Legend</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Not Attempted</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Marked for Review</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Attempted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;