import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiBriefcase, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    wilaya: '',
    role: 'Healthcare Professional', // Default to match Laravel enum
    password: '',
    password_confirmation: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
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
    setErrors({});

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 422 && data.errors) {
          setErrors(data.errors);
          throw new Error('Validation failed');
        }
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful
      navigate('/login', {
        state: { message: data.message }
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
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <img 
              src="/logo.png" 
              alt="HealthLink Logo" 
              className="h-12 mx-auto"
            />
            <h1 className="text-2xl font-bold mt-4">Create Healthcare Account</h1>
          </div>

          {/* Error Message */}
          {errors.server && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {errors.server}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name*</label>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name*</label>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number*</label>
              <input
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.phone_number ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
            </div>

            {/* Wilaya */}
            <div>
              <label className="block text-sm font-medium mb-1">Wilaya*</label>
              <input
                name="wilaya"
                value={formData.wilaya}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.wilaya ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.wilaya && <p className="text-red-500 text-xs mt-1">{errors.wilaya}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium mb-1">Role*</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="Healthcare Professional">Healthcare Professional</option>
                <option value="Supplier">Supplier</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">Password*</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password*</label>
              <div className="relative">
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.password_confirmation ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
              </div>
              {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 ${isLoading ? 'opacity-70' : ''}`}
            >
              {isLoading ? 'Submitting...' : 'Register'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-4">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600">Login</a>
          </p>
        </div>
      </div>

      {/* Image/Info Section */}
      <div className="hidden md:block md:w-1/2 bg-blue-600 text-white p-12">
        <div className="h-full flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6">Join HealthLink Network</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Secure healthcare professional network</span>
            </li>
            {/* Add more benefits as needed */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;