import { useState, useEffect } from "react";
import { FiUpload, FiSave, FiMapPin, FiPhone, FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const EditStorePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
 
  
  const [storeInfo, setStoreInfo] = useState({
    store_name: "",
    phone: "",
    address: "",
    owner_id: ""
  });

  // Fetch store data on component mount
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:8000/api/store/${id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
          }
        });
        
        const storeData = response.data?.data || response.data;

        setStoreInfo({
          store_name: storeData?.store_name || "",
          phone: storeData?.phone || "",
          address: storeData?.address || "",
          owner_id: storeData?.owner_id || ""
        });

       

      } catch (error) {
        console.error("Error fetching store data:", error);
        toast.error(error.response?.data?.message || "Failed to load store data");
        navigate('/store');
      } finally {
        setIsFetching(false);
      }
    };

    fetchStoreData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoreInfo(prev => ({ ...prev, [name]: value }));
  };

 

  const validateForm = () => {
    const requiredFields = ['store_name', 'phone', 'address'];
    const missingFields = requiredFields.filter(field => !storeInfo[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill out all required fields: ${missingFields.join(', ')}`);
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
      formData.append('_method', 'PUT');
      formData.append('store_name', storeInfo.store_name);
      formData.append('phone', storeInfo.phone);
      formData.append('address', storeInfo.address);
      formData.append('owner_id', storeInfo.owner_id);
  


      const authToken = localStorage.getItem('authToken');
      const response = await axios.post(`http://localhost:8000/api/store/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });
  
      if (response.status === 200) {
        toast.success("Medical store updated successfully!");
        navigate(`/store/${id}`);
      }
  
    } catch (error) {
      console.error("Error updating store:", error);
      
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
        toast.error(error.response?.data?.message || "Failed to update store");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
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
                Edit Medical Store
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
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>

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
              </div>

            </div>

            {/* Full width address field */}
            <div className="mt-6">
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
        </main>
      </div>
    </div>
  );
};

export default EditStorePage;