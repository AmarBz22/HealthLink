import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Shield, Activity, Users, User, Phone, MapPin, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo1.png"


const SignupPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    wilaya: '',
    role: 'Dentist', // Updated default role to match backend validation
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://192.168.43.101:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          setErrors(data.errors);
          throw new Error('Validation failed');
        }
        throw new Error(data.message || 'Registration failed');
      }

      navigate('/registration-confirmation', { 
        state: { 
          userData: formData,
          message: data.message || 'Your registration request has been submitted. An admin will review it.' 
        } 
      });

    } catch (error) {
      console.error('Registration error:', error);
      if (!errors.server) {
        setErrors(prev => ({
          ...prev,
          server: error.message || 'Registration failed. Please try again.'
        }));
      }
    } finally {
      setIsLoading(false);
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
              <span className="text-[#00796B] font-medium text-sm">Join Our Network</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Create Your
              <span className="block text-[#00796B]">HealthLink Account</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Join thousands of healthcare professionals in Algeria's most trusted medical networking platform.
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-4">
            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
              <div className="flex-shrink-0 w-12 h-12 bg-[#00796B]/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#00796B]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Quick Approval</h3>
                <p className="text-sm text-gray-600">Get approved within 1-2 business days</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
              <div className="flex-shrink-0 w-12 h-12 bg-[#00796B]/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-[#00796B]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Nationwide Network</h3>
                <p className="text-sm text-gray-600">Connect with suppliers across Algeria</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
              <div className="flex-shrink-0 w-12 h-12 bg-[#00796B]/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#00796B]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Verified Professionals</h3>
                <p className="text-sm text-gray-600">Join verified healthcare professionals only</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Signup Form */}
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
                  <div className="text-[#00796B] font-bold text-xl" style={{display: 'none'}}>H</div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Join HealthLink</h2>
                <p className="text-gray-600 mt-1">Create your professional account</p>
              </div>
            </div>

            {/* Form */}
            <div className="px-8 pb-8">
              {/* Error Message */}
              {errors.server && (
                <div className="mb-6 p-4 rounded-xl flex items-start bg-red-50 border border-red-200 text-red-700">
                  <AlertCircle className="flex-shrink-0 h-5 w-5 mt-0.5 mr-3" />
                  <div>
                    <p className="font-semibold text-sm">Registration Failed</p>
                    <p className="text-sm mt-1">{errors.server}</p>
                  </div>
                </div>
              )}

              <div onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="text-gray-400 h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-colors placeholder-gray-400 ${
                          errors.first_name ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="First Name"
                        required
                      />
                    </div>
                    {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="text-gray-400 h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-colors placeholder-gray-400 ${
                          errors.last_name ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="Last Name"
                        required
                      />
                    </div>
                    {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
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
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-colors placeholder-gray-400 ${
                        errors.email ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Phone and Wilaya */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="text-gray-400 h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-colors placeholder-gray-400 ${
                          errors.phone_number ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="05 00 00 00 00"
                        required
                      />
                    </div>
                    {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Wilaya
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="text-gray-400 h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        name="wilaya"
                        value={formData.wilaya}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-colors placeholder-gray-400 ${
                          errors.wilaya ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="Algiers"
                        required
                      />
                    </div>
                    {errors.wilaya && <p className="text-red-500 text-xs mt-1">{errors.wilaya}</p>}
                  </div>
                </div>

                {/* Role Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Professional Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Briefcase className="text-gray-400 h-5 w-5" />
                    </div>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-colors appearance-none bg-white"
                      required
                    >
                      <option value="Dentist">Dentist</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Labo">Labo</option>
                      <option value="Pharmacist">Pharmacist</option>
                      <option value="Supplier">Supplier</option>
                    </select>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
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
                        className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-colors placeholder-gray-400 ${
                          errors.password ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="At least 6 characters"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff className="text-gray-400 hover:text-gray-600 h-5 w-5" />
                        ) : (
                          <Eye className="text-gray-400 hover:text-gray-600 h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="text-gray-400 h-5 w-5" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-colors placeholder-gray-400 ${
                          errors.password_confirmation ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="text-gray-400 hover:text-gray-600 h-5 w-5" />
                        ) : (
                          <Eye className="text-gray-400 hover:text-gray-600 h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="h-4 w-4 text-[#00796B] focus:ring-[#00796B] border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div className="text-sm">
                    <label htmlFor="terms" className="text-gray-700">
                      I agree to the{' '}
                      <a href="#" className="text-[#00796B] hover:text-[#00695C] font-medium">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-[#00796B] hover:text-[#00695C] font-medium">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !acceptedTerms}
                  onClick={handleSubmit}
                  className={`w-full py-3 px-4 bg-[#00796B] text-white rounded-xl hover:bg-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:ring-offset-2 transition-all duration-200 font-semibold ${
                    isLoading || !acceptedTerms ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Register'}
                </button>
              </div>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <a 
                    href="/login" 
                    className="text-[#00796B] hover:text-[#00695C] font-semibold"
                  >
                    Login here
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Features - Only visible on small screens */}
          <div className="lg:hidden mt-8 space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
              <Shield className="w-5 h-5 text-[#00796B] flex-shrink-0" />
              <span className="text-sm text-gray-700">Quick 1-2 day approval process</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
              <Users className="w-5 h-5 text-[#00796B] flex-shrink-0" />
              <span className="text-sm text-gray-700">Join verified professionals network</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;