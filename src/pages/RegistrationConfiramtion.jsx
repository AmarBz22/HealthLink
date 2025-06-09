import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Mail, Clock, ArrowRight, User, Shield, Activity, Users, AlertCircle } from 'lucide-react';

const RegistrationConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, message } = location.state || {};
  const [emailSent, setEmailSent] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Section - Hero Content */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-green-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 font-medium text-sm">Registration Submitted</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Welcome to the
              <span className="block text-[#00796B]">HealthLink Family</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Your registration is under review. You'll soon join our secure network of healthcare professionals and suppliers.
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-4">
            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
              <div className="flex-shrink-0 w-12 h-12 bg-[#00796B]/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#00796B]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Secure Network</h3>
                <p className="text-sm text-gray-600">Join our verified healthcare professional community</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Quick Approval</h3>
                <p className="text-sm text-gray-600">Typical review time: 24-48 hours</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Email Notification</h3>
                <p className="text-sm text-gray-600">You'll receive login instructions once approved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Confirmation Content */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 bg-gradient-to-r from-green-500/5 to-[#00796B]/5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-xl mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Registration Submitted!</h2>
                <p className="text-gray-600 mt-1">Thank you for joining HealthLink</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 pb-8">
              {/* Success Message */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start">
                  <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-green-800 font-semibold text-sm">Registration Received</p>
                    <p className="text-green-700 text-sm mt-1">
                      {message || 'Your registration request has been submitted for admin approval.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Registration Details */}
              {userData && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="mr-2 h-5 w-5 text-[#00796B]" />
                    Your Registration Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">{userData.first_name} {userData.last_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">{userData.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">{userData.phone_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Role:</span>
                      <span className="font-medium text-gray-900">{userData.role}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Wilaya:</span>
                      <span className="font-medium text-gray-900">{userData.wilaya}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start">
                  <AlertCircle className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-semibold text-blue-800 text-sm">What happens next?</h4>
                    <ul className="text-blue-700 text-sm mt-2 space-y-1">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                        Admin reviews your credentials (1-2 business days)
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                        You'll receive an approval email with login instructions
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                        Start connecting with healthcare professionals
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Timing Info */}
              <div className="flex items-center justify-center mb-6 p-3 bg-gray-50 rounded-lg">
                <Clock className="mr-2 h-5 w-5 text-gray-500" />
                <span className="text-gray-600 text-sm font-medium">Typical approval time: 24-48 hours</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-4 bg-[#00796B] text-white rounded-xl hover:bg-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:ring-offset-2 transition-all duration-200 font-semibold hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center"
                >
                  Go to Login
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-semibold"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Features - Only visible on small screens */}
          <div className="lg:hidden mt-8 space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
              <Shield className="w-5 h-5 text-[#00796B] flex-shrink-0" />
              <span className="text-sm text-gray-700">Secure healthcare network</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
              <Clock className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">Quick 24-48 hour approval</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
              <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">Email notification when approved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationConfirmation;