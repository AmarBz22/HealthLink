import { useState, useEffect } from "react";
import { 
  FiUpload, 
  FiSave, 
  FiPlusCircle, 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiTrash2,
  FiArrowLeft
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const StoreManagementPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [storeInfo, setStoreInfo] = useState({
    store_name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    specialties: [""],
    owner_id: "" // Added owner_id field
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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Logo file size must be less than 2MB");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const addSpecialty = () => {
    setStoreInfo(prev => ({
      ...prev,
      specialties: [...prev.specialties, ""]
    }));
  };

  const removeSpecialty = (index) => {
    setStoreInfo(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const handleSpecialtyChange = (index, value) => {
    const newSpecialties = [...storeInfo.specialties];
    newSpecialties[index] = value;
    setStoreInfo(prev => ({ ...prev, specialties: newSpecialties }));
  };

  const validateForm = () => {
    const requiredFields = ['store_name', 'description', 'phone', 'email', 'address', 'owner_id'];
    const missingFields = requiredFields.filter(field => !storeInfo[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill out all required fields: ${missingFields.join(', ').replace('owner_id', 'owner')}`);
      return false;
    }
    
    if (!storeInfo.specialties[0].trim()) {
      toast.error("At least one specialty is required");
      return false;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(storeInfo.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    
    const phonePattern = /^\+?[\d\s\-()]{10,20}$/;
    if (!phonePattern.test(storeInfo.phone)) {
      toast.error("Please enter a valid phone number");
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
      formData.append('description', storeInfo.description);
      formData.append('phone', storeInfo.phone);
      formData.append('email', storeInfo.email);
      formData.append('address', storeInfo.address);
      formData.append('owner_id', storeInfo.owner_id); // Added owner_id
      
      storeInfo.specialties.forEach(spec => {
        if (spec.trim()) formData.append('specialties[]', spec);
      });
  
      if (logoFile) {
        formData.append('logo', logoFile);
      }
  
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
          
          // Fixed endpoint from 'stores' to 'store'
          const retryResponse = await axios.post('http://localhost:8000/api/store', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${newAuthToken}`,
              'Accept': 'application/json'
            }
          });
          
          toast.success("Medical store created successfully!");
          navigate('/store'); // Fixed from '/stores' to '/store'
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
                </div>
              </div>
            </div>
          )}

          {/* Store Information Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#00796B] mb-4 border-b pb-2">Store Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
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

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={storeInfo.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00796B] focus:border-[#00796B] focus:outline-none"
                    placeholder="Specializing in medications and health products..."
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Specialties<span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {storeInfo.specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={specialty}
                          onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00796B] focus:border-[#00796B] focus:outline-none"
                          placeholder="e.g., Pharmacy, Medications"
                          required={index === 0}
                        />
                        {storeInfo.specialties.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSpecialty(index)}
                            className="p-2 text-red-500 hover:text-red-700 transition-colors"
                            aria-label="Remove specialty"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSpecialty}
                      className="flex items-center text-sm text-[#00796B] hover:text-[#00695C] transition-colors"
                    >
                      <FiPlusCircle className="mr-1" /> Add Another Specialty
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Logo</label>
                  <div className="flex items-center">
                    <label className="cursor-pointer w-full">
                      <div 
                        className={`border-2 border-dashed ${logoPreview ? 'border-[#00796B]' : 'border-gray-300'} 
                          rounded-md p-4 flex flex-col items-center justify-center h-40 
                          hover:border-[#00796B] transition-colors`}
                      >
                        {logoPreview ? (
                          <div className="relative flex flex-col items-center">
                            <img 
                              src={logoPreview} 
                              alt="Store logo preview" 
                              className="max-h-24 object-contain mb-2"
                            />
                            <span className="text-sm text-[#00796B]">Click to change</span>
                          </div>
                        ) : (
                          <>
                            <FiUpload className="text-gray-400 text-3xl mb-2" />
                            <span className="text-sm text-gray-500">Click to upload logo</span>
                            <span className="text-xs text-gray-400 mt-1">(JPEG, PNG, max 2MB)</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
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
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email<span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-[#00796B] focus-within:border-[#00796B]">
                      <FiMail className="text-gray-400 mr-2" />
                      <input
                        type="email"
                        name="email"
                        value={storeInfo.email}
                        onChange={handleInputChange}
                        className="flex-1 focus:outline-none"
                        placeholder="contact@example.com"
                        required
                      />
                    </div>
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StoreManagementPage;