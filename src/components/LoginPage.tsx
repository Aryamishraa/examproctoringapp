import React, { useState } from 'react';
import { Shield, User, Lock, Hash, Settings } from 'lucide-react';
import { User as UserType } from '../App';
import { studentMonitoringService } from '../services/StudentMonitoringService';

// during development use local backend, adjust as needed
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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
      setErrors("All fields are required");
      return;
    }

    if (formData.enrollmentNo.length < 6) {
      setErrors("Enrollment number must be at least 6 characters");
      return;
    }

    if (formData.password.length < 6) {
      setErrors("Password must be at least 6 characters");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollmentNo: formData.enrollmentNo,
          name: formData.name,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log("Backend Response:", data);

      if (!response.ok) {
        setErrors(data.message || "Invalid credentials");
        return;
      }

      // Use backend returned data instead of manual name
      const user: UserType = {
        enrollmentNo: data.student.enrollmentNo,
        name: data.student.name,
        studentId: data.student._id,
      };

      studentMonitoringService.addStudent(
        user.enrollmentNo,
        user.name,
        formData.password
      );

      onLogin(user);

    } catch (error) {
      console.error("Login error:", error);
      setErrors("Server connection failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">

        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Safe Examiner
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Secure Online Examination Platform
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">

            {/* Enrollment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enrollment/Seat Number
              </label>

              <div className="relative">
                <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400"/>
                <input
                  name="enrollmentNo"
                  type="text"
                  required
                  value={formData.enrollmentNo}
                  onChange={handleInputChange}
                  className="block w-full pl-10 py-3 border rounded-lg"
                  placeholder="Enter your enrollment number"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400"/>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full pl-10 py-3 border rounded-lg"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400"/>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="off"
                  className="block w-full pl-10 py-3 border rounded-lg"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {errors && (
              <div className="text-red-600 text-sm text-center bg-red-50 py-2 rounded">
                {errors}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Sign In
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToAdmin}
                className="text-sm text-gray-600 flex items-center justify-center gap-2 mx-auto"
              >
                <Settings className="h-4 w-4"/>
                Access Admin Panel
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;