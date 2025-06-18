import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Shield, Activity, Users } from 'lucide-react';
import logo from "../assets/logo1.png"


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
      const response = await fetch('http://192.168.43.101:8000/api/login', {
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
      
      // Role-based redirect
      const userRole = data.user?.role;
      
      if (userRole === 'Admin' || userRole === 'Supplier') {
        navigate('/dashboard');
      } else {
        navigate('/home');
      }
  
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Section - Hero Content */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-[#00796B]/20">
              <div className="w-2 h-2 bg-[#00796B] rounded-full animate-pulse"></div>
              <span className="text-[#00796B] font-medium text-sm">Trusted Healthcare Platform</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Welcome to
              <span className="block text-[#00796B]">HealthLink</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Your secure digital bridge connecting healthcare providers, pharmacies, and medical suppliers in one unified platform.
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-4">
    
            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
              <div className="flex-shrink-0 w-12 h-12 bg-[#00796B]/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-[#00796B]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Real-time Tracking</h3>
                <p className="text-sm text-gray-600">Live inventory and order status updates</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
              <div className="flex-shrink-0 w-12 h-12 bg-[#00796B]/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#00796B]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Professional Network</h3>
                <p className="text-sm text-gray-600">Connect with verified healthcare professionals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 bg-gradient-to-r from-[#00796B]/5 to-[#004D40]/5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4">
                  <img 
                    src= {logo} 
                    alt="HealthLink Logo" 
                    className="h-20 w-20 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="text-white font-bold text-xl" style={{display: 'none'}}>H</div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                <p className="text-gray-600 mt-1">Sign in to your HealthLink account</p>
              </div>
            </div>

            {/* Form */}
            <div className="px-8 pb-8">
              {/* Error Message */}
              {error && (
                <div className={`mb-6 p-4 rounded-xl flex items-start ${
                  isBannedError 
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  <AlertCircle className="flex-shrink-0 h-5 w-5 mt-0.5 mr-3" />
                  <div>
                    <p className="font-semibold text-sm">
                      {isBannedError ? 'Account Restricted' : 'Login Failed'}
                    </p>
                    <p className="text-sm mt-1">{error}</p>
                    {isBannedError && (
                      <a 
                        href="/contact-support" 
                        className="inline-block mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
                      >
                        Contact Support
                      </a>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={handleKeyDown}>
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="text-gray-400 h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-colors placeholder-gray-400"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="text-gray-400 h-5 w-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-colors placeholder-gray-400"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="text-gray-400 hover:text-gray-600 h-5 w-5" />
                      ) : (
                        <Eye className="text-gray-400 hover:text-gray-600 h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#00796B] focus:ring-[#00796B] focus:ring-offset-0" 
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <a 
                    href="/forgot-password" 
                    className="text-sm text-[#00796B] hover:text-[#00695C] font-medium"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 bg-[#00796B] text-white rounded-xl hover:bg-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:ring-offset-2 transition-all duration-200 font-semibold ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <a 
                    href="/signup" 
                    className="text-[#00796B] hover:text-[#00695C] font-semibold"
                  >
                    Sign up
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Features - Only visible on small screens */}
          <div className="lg:hidden mt-8 space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
              <Shield className="w-5 h-5 text-[#00796B] flex-shrink-0" />
              <span className="text-sm text-gray-700">HIPAA-compliant secure platform</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
              <Activity className="w-5 h-5 text-[#00796B] flex-shrink-0" />
              <span className="text-sm text-gray-700">Real-time inventory tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;