import React, { useState, useEffect } from 'react';
import { LogOut, Camera, Mic, ChevronLeft, ChevronRight, Flag, SkipForward, Save, AlertTriangle, X } from 'lucide-react';
import { User } from '../App';
import { questions } from '../data/questions';
import { examService } from '../services/ExamService';
import { studentMonitoringService, StudentActivity } from '../services/StudentMonitoringService';
import CameraFeed from './CameraFeed';

interface ExamPageProps {
  user: User;
  onSubmitExam: () => void;
  onLogout: () => void;
}

type QuestionStatus = 'not-attempted' | 'attempted' | 'marked-for-review' | 'skipped';

const ExamPage: React.FC<ExamPageProps> = ({ user, onSubmitExam, onLogout }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [questionStatuses, setQuestionStatuses] = useState<{ [key: number]: QuestionStatus }>({});
  const [timeRemaining, setTimeRemaining] = useState(3 * 60 * 60); // 3 hours in seconds
  const [showCamera, setShowCamera] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [examStartTime] = useState(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [examWarnings, setExamWarnings] = useState<StudentActivity[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onSubmitExam]);

  useEffect(() => {
    // Subscribe to exam warnings/activities
    const unsubscribe = studentMonitoringService.onActivity((activity) => {
      // Track monitoring and warning activities
      const monitoringActivityTypes = ['warning_received', 'camera_off', 'camera_on', 'mic_off', 'mic_on', 'tab_switch', 'speaking', 'silent', 'disconnected', 'student_not_visible'];
      if (user.studentId && activity.studentId === user.studentId && monitoringActivityTypes.includes(activity.type)) {
        setExamWarnings(prev => {
          // Prevent duplicate warnings by checking if one with same timestamp already exists
          const isDuplicate = prev.some(w => Math.abs(w.timestamp.getTime() - activity.timestamp.getTime()) < 100);
          if (isDuplicate) {
            return prev;
          }
          return [activity, ...prev];
        });
      }
    });

    return () => unsubscribe();
  }, [user.studentId]);

  const handleCameraStatusChange = (status: boolean) => {
    if (!status && isCameraOn && user.studentId) {
      // Camera turned off, record activity
      studentMonitoringService.recordActivity(
        user.studentId,
        'camera_off',
        'Camera turned off',
        'high'
      );
    }
    setIsCameraOn(status);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));

    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestion]: 'attempted'
    }));

    // Track answer in exam service
    if (user.studentId) {
      examService.answerQuestion(user.studentId, currentQuestion + 1, value);
    }
  };

  const handleSkipQuestion = () => {
    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestion]: 'skipped'
    }));

    // Track skip in exam service
    if (user.studentId) {
      examService.skipQuestion(user.studentId, currentQuestion + 1);
    }
  };

  const handleMarkForReview = () => {
    setQuestionStatuses(prev => ({
      ...prev,
      [currentQuestion]: 'marked-for-review'
    }));
  };

  const handleSaveProgress = async () => {
    if (!user.studentId) return;
    
    setIsSaving(true);
    try {
      // Save progress to exam service
      await examService.saveProgress(user.studentId, {
        currentQuestion: currentQuestion + 1,
        answers,
        questionStatuses,
        timeRemaining,
        examStartTime
      });
      
      setLastSaved(new Date());
      
      // Show success message (you can add a toast notification here)
      console.log('Progress saved successfully!');
    } catch (error) {
      console.error('Failed to save progress:', error);
      // Show error message (you can add a toast notification here)
    } finally {
      setIsSaving(false);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getQuestionStatus = (index: number): QuestionStatus => {
    return questionStatuses[index] || 'not-attempted';
  };

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case 'attempted':
        return 'bg-green-500';
      case 'marked-for-review':
        return 'bg-yellow-500';
      case 'skipped':
        return 'bg-orange-500';
      default:
        return 'bg-red-500';
    }
  };

  const getAttemptedCount = () => {
    return Object.values(questionStatuses).filter(status => 
      status === 'attempted' || status === 'marked-for-review' || status === 'skipped'
    ).length;
  };

  const getAnsweredCount = () => {
    return Object.values(questionStatuses).filter(status => status === 'attempted').length;
  };

  const getSkippedCount = () => {
    return Object.values(questionStatuses).filter(status => status === 'skipped').length;
  };

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Computer Science Engineering Exam</h1>
              <div className="text-sm text-gray-600">
                Student: {user.name} | ID: {user.enrollmentNo}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Camera className={`h-4 w-4 ${isCameraOn ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm ${isCameraOn ? 'text-green-600' : 'text-red-600'}`}>
                  Camera {isCameraOn ? 'On' : 'Off'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mic className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Mic On</span>
              </div>
              <div className="text-lg font-mono font-bold text-red-600">
                {formatTime(timeRemaining)}
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Exam Monitoring Warnings */}
      {examWarnings.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="text-sm font-semibold text-red-900">Exam Monitoring Warnings ({examWarnings.length})</h3>
              </div>
              <button
                onClick={() => setExamWarnings([])}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {examWarnings.map((warning, index) => (
                <div key={index} className={`flex items-center justify-between p-2 rounded text-sm ${
                  warning.severity === 'high' ? 'bg-red-100 text-red-800' :
                  warning.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  <div className="flex-1">
                    <span className="font-medium">{warning.details}</span>
                    <span className="text-xs opacity-75 ml-2">{warning.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <button
                    onClick={() => setExamWarnings(prev => prev.filter((_, i) => i !== index))}
                    className="ml-2 opacity-75 hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Question {currentQuestion + 1} of {questions.length}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSkipQuestion}
                    className="inline-flex items-center px-3 py-2 border border-orange-300 text-sm font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 transition duration-200"
                  >
                    <SkipForward className="h-4 w-4 mr-2" />
                    Skip
                  </button>
                  <button
                    onClick={handleMarkForReview}
                    className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition duration-200"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Mark for Review
                  </button>
                </div>
              </div>

              {/* Save Component - Only show at 70th question after selecting an answer */}
              {currentQuestion === 69 && answers[currentQuestion] && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Save className="h-5 w-5 text-green-600" />
                      <div>
                        <h3 className="text-sm font-medium text-green-900">Answer Selected!</h3>
                        <p className="text-xs text-green-700">
                          You've selected an answer for question 70. Save your progress before submitting the exam.
                        </p>
                        {lastSaved && (
                          <p className="text-xs text-green-600 mt-1">
                            Last saved: {lastSaved.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSaveProgress}
                        disabled={isSaving}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Progress
                          </>
                        )}
                      </button>
                      <button
                        onClick={onSubmitExam}
                        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition duration-200"
                      >
                        Submit Exam
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Component - Only show at 70th question before selecting an answer */}
              {currentQuestion === 69 && !answers[currentQuestion] && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Save className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-900">Final Question</h3>
                      <p className="text-xs text-blue-700">
                        You've reached question 70. Please select an answer to proceed with saving and submitting your exam.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-8">
                <div className="mb-4">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {question.category}
                  </span>
                </div>
                
                <p className="text-gray-800 text-lg leading-relaxed mb-6">{question.question}</p>
                
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition duration-200"
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option}
                        checked={answers[currentQuestion] === option}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestion === 0}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>

                <div className="flex space-x-3">
                  {currentQuestion < questions.length - 1 && currentQuestion !== 69 ? (
                    <button
                      onClick={goToNextQuestion}
                      className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition duration-200"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  ) : currentQuestion === 69 && answers[currentQuestion] ? (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSaveProgress}
                        disabled={isSaving}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Progress
                          </>
                        )}
                      </button>
                      <button
                        onClick={onSubmitExam}
                        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition duration-200"
                      >
                        Submit Exam
                      </button>
                    </div>
                  ) : currentQuestion === questions.length - 1 ? (
                    <button
                      onClick={onSubmitExam}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition duration-200"
                    >
                      End Exam
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Camera Feed */}
            {showCamera && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Camera Monitoring</h3>
                <CameraFeed user={user} onCameraStatusChange={handleCameraStatusChange} />
              </div>
            )}

            {/* Progress Summary */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Progress Summary</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Questions:</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Answered:</span>
                  <span className="font-medium">{getAnsweredCount()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-600">Skipped:</span>
                  <span className="font-medium">{getSkippedCount()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Attempted:</span>
                  <span className="font-medium">{getAttemptedCount()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Remaining:</span>
                  <span className="font-medium">{questions.length - getAttemptedCount()}</span>
                </div>
              </div>
            </div>

            {/* Question Navigator */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Questions Overview</h3>
              <p className="text-xs text-gray-600 mb-3">
                Attempted: {getAttemptedCount()} / {questions.length}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 text-xs font-medium rounded-md text-white transition duration-200 ${
                      index === currentQuestion
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : ''
                    } ${getStatusColor(getQuestionStatus(index))} ${
                      index === 69 ? 'border-2 border-yellow-400' : ''
                    }`}
                    title={index === 69 ? 'Final Question - Save & Submit Required' : `Question ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              {/* Special Note for Question 70 */}
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800 font-medium">
                  ⚠️ Question 70: Final question requires saving before submission
                </p>
              </div>

              {/* Legend */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Not Attempted</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">Skipped</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">Marked for Review</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Attempted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;