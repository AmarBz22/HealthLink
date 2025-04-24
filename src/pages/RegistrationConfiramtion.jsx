import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiMail, FiClock, FiArrowRight, FiUser } from 'react-icons/fi';
import { useState } from 'react';

const RegistrationConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, message } = location.state || {};
  const [emailSent, setEmailSent] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Content Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <img 
              src="/logo.png" 
              alt="HealthLink Logo" 
              className="h-12 mx-auto"
            />
            <h1 className="text-2xl font-bold mt-4">Registration Submitted</h1>
          </div>

          {/* Confirmation Card */}
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="flex justify-center mb-4">
              <FiCheckCircle className="h-12 w-12 text-green-500" />
            </div>
            
            <h2 className="text-xl font-semibold mb-4">Thank You for Registering!</h2>
            
            <p className="mb-6 text-gray-600">
              {message || 'Your registration request has been submitted for admin approval.'}
            </p>

            {userData && (
              <div className="mb-6 text-left bg-gray-50 p-4 rounded">
                <h3 className="font-medium mb-2 flex items-center">
                  <FiUser className="mr-2" /> Your Registration Details:
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {userData.first_name} {userData.last_name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {userData.email}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {userData.phone_number}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> {userData.role}
                  </div>
                  <div>
                    <span className="font-medium">Wilaya:</span> {userData.wilaya}
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <FiMail className="mt-1 mr-2 text-blue-500 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800">What to expect next:</h4>
                  <ul className="list-disc list-inside text-sm text-blue-700 space-y-1 mt-1">
                    <li>Admin will review your credentials (1-2 business days)</li>
                    <li>You'll receive an approval email when accepted</li>
                    <li>The email will contain your login instructions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center mb-6 text-gray-500">
              <FiClock className="mr-2" />
              <span>Typical approval time: 24-48 hours</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center py-2 px-4 bg-[#00796B] text-white rounded hover:bg-[#00695C] transition-colors"
              >
                Go to Login <FiArrowRight className="ml-2" />
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full py-2 px-4 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image/Info Section */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-[#00796B] to-[#004D40] text-white p-12">
        <div className="h-full flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6">Join HealthLink Network</h2>
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
              <span>Connect with medical suppliers nationwide</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>HIPAA-compliant secure platform</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Quick approval process (1-2 business days)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegistrationConfirmation;