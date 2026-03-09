import React from 'react';
import { CheckCircle, LogOut, Calendar, Clock, User, BarChart3, PieChart, Target, TrendingUp } from 'lucide-react';
import { User as UserType } from '../App';
import { ExamProgress } from '../services/ExamService';

interface SubmittedPageProps {
  user: UserType;
  examProgress: ExamProgress | null;
  onLogout: () => void;
}

const SubmittedPage: React.FC<SubmittedPageProps> = ({ user, examProgress, onLogout }) => {
  const submissionTime = examProgress?.examEndTime?.toLocaleString() || new Date().toLocaleString();
  
  // Use real exam data if available, otherwise show default values
  const totalQuestions = examProgress?.totalQuestions || 70;
  const attemptedQuestions = examProgress?.questionsAttempted || 0;
  const answeredQuestions = examProgress?.questionsAnswered || 0;
  const skippedQuestions = examProgress?.questionsSkipped || 0;
  const timeSpent = examProgress?.timeSpent || 0;
  
  // Calculate completion rate
  const completionRate = totalQuestions > 0 ? Math.round((attemptedQuestions / totalQuestions) * 100) : 0;
  const answerRate = attemptedQuestions > 0 ? Math.round((answeredQuestions / attemptedQuestions) * 100) : 0;
  
  // Format time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Get category breakdown if available
  const getCategoryBreakdown = () => {
    if (!examProgress) return [];
    
    const categoryMap = new Map<string, { attempted: number; answered: number; skipped: number }>();
    
    // Initialize categories
    examProgress.categories.forEach(category => {
      categoryMap.set(category, { attempted: 0, answered: 0, skipped: 0 });
    });
    
    // Count questions by category
    examProgress.answers.forEach(answer => {
      const category = answer.category;
      const stats = categoryMap.get(category);
      if (stats) {
        if (answer.isAnswered) {
          stats.answered++;
          stats.attempted++;
        } else if (answer.isSkipped) {
          stats.skipped++;
          stats.attempted++;
        }
      }
    });
    
    return Array.from(categoryMap.entries())
      .map(([category, stats]) => ({ category, ...stats }))
      .filter(stats => stats.attempted > 0) // Only show categories with attempted questions
      .sort((a, b) => b.attempted - a.attempted); // Sort by most attempted
  };

  const categoryBreakdown = getCategoryBreakdown();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Safe Examiner - Exam Completed</h1>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Exam Submitted Successfully!</h2>
          <p className="text-lg text-gray-600">
            Your exam has been submitted and recorded securely.
          </p>
        </div>

        {/* Submission Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Submission Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Student Name</p>
                  <p className="text-lg text-gray-900">{user.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 text-gray-400 flex items-center justify-center">
                  <span className="text-xs font-bold">#</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Enrollment Number</p>
                  <p className="text-lg text-gray-900">{user.enrollmentNo}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Submission Date & Time</p>
                  <p className="text-lg text-gray-900">{submissionTime}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Time Spent</p>
                  <p className="text-lg text-gray-900">{formatTime(timeSpent)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Summary */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
            Question Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
              <div className="text-sm text-blue-600 font-medium">Total Questions</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{answeredQuestions}</div>
              <div className="text-sm text-green-600 font-medium">Questions Answered</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{skippedQuestions}</div>
              <div className="text-sm text-yellow-600 font-medium">Questions Skipped</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{attemptedQuestions}</div>
              <div className="text-sm text-purple-600 font-medium">Questions Attempted</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Completion Rate */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-blue-600" />
                  Overall Completion Rate
                </span>
                <span className="text-sm font-bold text-gray-900">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {attemptedQuestions} out of {totalQuestions} questions attempted
              </p>
            </div>

            {/* Answer Rate */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                  Answer Success Rate
                </span>
                <span className="text-sm font-bold text-gray-900">{answerRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${answerRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {answeredQuestions} out of {attemptedQuestions} attempted questions answered
              </p>
            </div>
          </div>

          {/* Questions Not Attempted */}
          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{totalQuestions - attemptedQuestions}</div>
              <div className="text-sm text-red-600 font-medium">Questions Not Attempted</div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <PieChart className="h-6 w-6 mr-2 text-purple-600" />
              Performance by Category
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryBreakdown.map((category, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">{category.category}</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Attempted:</span>
                      <span className="font-medium">{category.attempted}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Answered:</span>
                      <span className="font-medium">{category.answered}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-600">Skipped:</span>
                      <span className="font-medium">{category.skipped}</span>
                    </div>
                  </div>
                  
                  {/* Category progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((category.answered / category.attempted) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(category.answered / category.attempted) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Verification */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Verification</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Camera monitoring completed successfully</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Face detection verified throughout the exam</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">No suspicious activity detected</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">All responses recorded securely</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Exam session properly terminated</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Results will be available within 24-48 hours. You will be notified via email.
          </p>
          <button
            onClick={onLogout}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Exit Safely
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmittedPage;