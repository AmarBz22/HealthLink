import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft, FiHome } from 'react-icons/fi';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#E0F2F1] flex items-center justify-center">
              <FiAlertCircle size={40} className="text-[#00796B]" />
            </div>
          </div>
          
          {/* Content */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
            <p className="text-gray-600">
              The page you are looking for doesn't exist or has been moved.
            </p>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center justify-center px-6 py-3 border border-[#00796B] text-[#00796B] rounded-lg hover:bg-[#E0F2F1] transition-colors font-medium"
            >
              <FiArrowLeft className="mr-2" /> Go Back
            </button>
            
            <button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center px-6 py-3 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors font-medium"
            >
              <FiHome className="mr-2" /> Home Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;