import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBannedError, setIsBannedError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsBannedError(false);

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle banned user case
        if (response.status === 403 && data.message.includes('banned')) {
          setIsBannedError(true);
          throw new Error(data.message);
        }
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to dashboard
      navigate('/dashboard');

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Left Section - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <img 
              src="/logo.png" 
              alt="HealthLink Logo" 
              className="h-12 mx-auto"
            />
            <h1 className="text-2xl font-bold mt-4">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your HealthLink account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-4 p-3 rounded text-sm flex items-start ${
              isBannedError 
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-red-100 text-red-700'
            }`}>
              <FiAlertCircle className="flex-shrink-0 h-4 w-4 mt-0.5 mr-2" />
              <div>
                <p className="font-medium">
                  {isBannedError ? 'Account Restricted' : 'Login Failed'}
                </p>
                <p className="text-sm">{error}</p>
                {isBannedError && (
                  <a 
                    href="/contact-support" 
                    className="inline-block mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Contact Support
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
            {/* Email Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email Address*</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Password*</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="text-gray-400 hover:text-gray-500" />
                  ) : (
                    <FiEye className="text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-teal-600" />
                <span className="ml-2 text-sm">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-500">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 bg-[#00796B] text-white rounded hover:bg-[#00695C] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="text-teal-600 hover:text-teal-500 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Image/Info */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-[#00796B] to-[#004D40] text-white p-12">
        <div className="h-full flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6">HealthLink Platform</h2>
          <p className="text-lg mb-8">
            Your trusted digital connection between healthcare providers, pharmacies, and medical suppliers.
          </p>
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Secure healthcare professional network</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Real-time inventory and order tracking</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>HIPAA-compliant secure platform</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;