import React, { useState } from 'react';
import { Shield, User, Lock, Hash, Settings } from 'lucide-react';
import { User as UserType } from '../App';
import { studentMonitoringService } from '../services/StudentMonitoringService';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
  onSwitchToAdmin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToAdmin }) => {
  const [formData, setFormData] = useState({
    enrollmentNo: '',
    name: '',
    password: ''
  });
  const [errors, setErrors] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.enrollmentNo.trim() || !formData.name.trim() || !formData.password.trim()) {
      setErrors('All fields are required');
      return;
    }

    if (formData.enrollmentNo.length < 6) {
      setErrors('Enrollment number must be at least 6 characters');
      return;
    }

    if (formData.password.length < 6) {
      setErrors('Password must be at least 6 characters');
      return;
    }

    try {
      // Add student to monitoring service
      const studentId = studentMonitoringService.addStudent(
        formData.enrollmentNo,
        formData.name,
        formData.password
      );

      // Create user object with student ID
      const user: UserType = {
        enrollmentNo: formData.enrollmentNo,
        name: formData.name,
        studentId: studentId // Add studentId to track in monitoring
      };

      onLogin(user);
    } catch (error) {
      setErrors('Error during login. Please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Safe Examiner</h2>
          <p className="mt-2 text-sm text-gray-600">Secure Online Examination Platform</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
            <div>
              <label htmlFor="enrollmentNo" className="block text-sm font-medium text-gray-700 mb-2">
                Enrollment/Seat Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="enrollmentNo"
                  name="enrollmentNo"
                  type="text"
                  required
                  value={formData.enrollmentNo}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your enrollment number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="off"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {errors && (
              <div className="text-red-600 text-sm text-center bg-red-50 py-2 px-3 rounded-md">
                {errors}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
            >
              Sign In
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToAdmin}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center space-x-2 mx-auto"
              >
                <Settings className="h-4 w-4" />
                <span>Access Admin Panel</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;