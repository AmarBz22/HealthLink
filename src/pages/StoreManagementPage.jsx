import { useState, useEffect } from "react";
import { 
  FiUpload, 
  FiSave, 
  FiMapPin, 
  FiPhone, 
  FiArrowLeft
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const StoreManagementPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const [storeInfo, setStoreInfo] = useState({
    store_name: "",
    phone: "",
    address: "",
    owner_id: ""
  });

  // Fetch current user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          toast.error("Not authenticated, please login again");
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:8000/api/user', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
          }
        });

        if (response.data) {
          setCurrentUser(response.data);
          setStoreInfo(prev => ({ ...prev, owner_id: response.data.id }));
          
          // Check if user role is allowed to create store (not a Doctor/Dentist)
          const userRole = response.data.role;
          if (userRole === 'Doctor' || userRole === 'Dentist') {
            setIsAuthorized(false);
            toast.error("Doctors are not authorized to create stores");
            setTimeout(() => navigate('/dashboard'), 3000);
          } else {
            setIsAuthorized(true);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoreInfo(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = ['store_name', 'phone', 'address', 'owner_id'];
    const missingFields = requiredFields.filter(field => !storeInfo[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill out all required fields: ${missingFields.join(', ').replace('owner_id', 'owner')}`);
      return false;
    }
    
    const phonePattern = /^\+?[\d\s\-()]{10,15}$/;
    if (!phonePattern.test(storeInfo.phone)) {
      toast.error("Please enter a valid phone number (maximum 15 characters)");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
  
    try {
      const formData = new FormData();
      formData.append('store_name', storeInfo.store_name);
      formData.append('phone', storeInfo.phone);
      formData.append('address', storeInfo.address);
      formData.append('owner_id', storeInfo.owner_id);
  
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No authentication token found');
      }
  
      const response = await axios.post('http://localhost:8000/api/store', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });
  
      if (response.status === 201) {
        toast.success("Medical store created successfully!");
        navigate('/store');
        return;
      }
  
    } catch (error) {
      console.error("Error creating store:", error);
      
      if (error.response?.status === 401) {
        try {
          const refreshResponse = await axios.post('/api/auth/refresh', {}, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          
          const newAuthToken = refreshResponse.data.authToken;
          localStorage.setItem('authToken', newAuthToken);
          
          const retryResponse = await axios.post('http://localhost:8000/api/store', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${newAuthToken}`,
              'Accept': 'application/json'
            }
          });
          
          toast.success("Medical store created successfully!");
          navigate('/store');
          return;
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          toast.error("Session expired. Please login again.");
          navigate('/login');
          return;
        }
      }
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        let errorMessages = [];
        
        for (const field in errors) {
          errorMessages.push(...errors[field]);
        }
        
        toast.error(
          <div>
            <strong>Validation errors:</strong>
            <ul className="list-disc pl-5 mt-1">
              {errorMessages.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        );
      } else {
        toast.error(error.response?.data?.message || "Failed to create store");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If user is not authorized (Doctor/Dentist), show access denied
  if (currentUser && !isAuthorized) {
    return (
      <div className="flex w-full min-h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            Doctors are not authorized to create stores. You'll be redirected to the dashboard.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-[#00796B] hover:bg-[#00695C] text-white px-4 py-2 rounded-md"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <main className="p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Go back"
              >
                <FiArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                Create New Medical Store
              </h1>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={isLoading}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#00796B] hover:bg-[#00695C] text-white'
              }`}
            >
              <FiSave className="mr-2" /> 
              {isLoading ? "Creating..." : "Create Store"}
            </button>
          </div>

          {/* Owner Info Display */}
          {currentUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mr-3">
                  {currentUser.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-medium text-blue-800">Creating store as: {currentUser.name}</p>
                  <p className="text-sm text-blue-600">{currentUser.email}</p>
                  <p className="text-sm text-blue-600">Role: {currentUser.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Store Information Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#00796B] mb-4 border-b pb-2">Store Details</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="store_name"
                  value={storeInfo.store_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00796B] focus:border-[#00796B] focus:outline-none"
                  placeholder="MediCare Pharmacy"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-[#00796B] focus-within:border-[#00796B]">
                  <FiPhone className="text-gray-400 mr-2" />
                  <input
                    type="tel"
                    name="phone"
                    value={storeInfo.phone}
                    onChange={handleInputChange}
                    className="flex-1 focus:outline-none"
                    placeholder="+1234567890"
                    maxLength={15}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Maximum 15 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address<span className="text-red-500">*</span>
                </label>
                <div className="flex items-start border border-gray-300 rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-[#00796B] focus-within:border-[#00796B]">
                  <FiMapPin className="text-gray-400 mr-2 mt-1" />
                  <textarea
                    name="address"
                    value={storeInfo.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="flex-1 focus:outline-none"
                    placeholder="123 Health St, City"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              <strong>Note:</strong> This form has been modified to match the backend requirements. 
              Fields like description, email, specialties, and logo have been removed as they are not validated by the backend.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StoreManagementPage;