import { useState, useEffect } from "react";
import { FiUpload, FiSave, FiPlusCircle, FiMapPin, FiPhone, FiMail, FiTrash2 } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const EditStorePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  
  const [storeInfo, setStoreInfo] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    specialties: [""]
  });

  // Fetch store data on component mount
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:8000/api/stores/${id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
          }
        });
        
        const storeData = response.data.data;
        setStoreInfo({
          name: storeData.name,
          description: storeData.description,
          phone: storeData.phone,
          email: storeData.email,
          address: storeData.address,
          specialties: storeData.specialties.length > 0 ? storeData.specialties : [""]
        });

        if (storeData.logo_url) {
          setLogoPreview(storeData.logo_url);
        }

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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT'); // For Laravel to recognize as PUT request
      formData.append('name', storeInfo.name);
      formData.append('description', storeInfo.description);
      formData.append('phone', storeInfo.phone);
      formData.append('email', storeInfo.email);
      formData.append('address', storeInfo.address);
      
      storeInfo.specialties.forEach(spec => {
        if (spec.trim()) formData.append('specialties[]', spec);
      });
  
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const authToken = localStorage.getItem('authToken');
      const response = await axios.post(`http://localhost:8000/api/stores/${id}`, formData, {
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
            <h1 className="text-2xl font-bold text-gray-800">
              Edit Medical Store
            </h1>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={storeInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00796B] focus:border-[#00796B]"
                    placeholder="MedEquip Solutions"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                  <textarea
                    name="description"
                    value={storeInfo.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00796B] focus:border-[#00796B]"
                    placeholder="Specializing in diagnostic imaging equipment and surgical supplies..."
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Specialties*</label>
                  <div className="space-y-2">
                    {storeInfo.specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={specialty}
                          onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-[#00796B] focus:border-[#00796B]"
                          placeholder="e.g., Cardiology, Radiology"
                          required={index === 0}
                        />
                        {storeInfo.specialties.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSpecialty(index)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSpecialty}
                      className="flex items-center text-sm text-[#00796B] hover:text-[#00695C]"
                    >
                      <FiPlusCircle className="mr-1" /> Add Another Specialty
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Logo</label>
                  <div className="flex items-center">
                    <label className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center hover:border-[#00796B] transition-colors">
                        {logoPreview ? (
                          <div className="relative">
                            <img 
                              src={logoPreview} 
                              alt="Store logo preview" 
                              className="w-20 h-20 object-contain"
                            />
                          </div>
                        ) : (
                          <>
                            <FiUpload className="text-gray-400 text-xl mb-1" />
                            <span className="text-sm text-gray-500">Click to upload logo</span>
                            <span className="text-xs text-gray-400">(JPEG, PNG, max 2MB)</span>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                    <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-[#00796B]">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                    <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-[#00796B]">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
                    <div className="flex items-start border border-gray-300 rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-[#00796B]">
                      <FiMapPin className="text-gray-400 mr-2 mt-1" />
                      <textarea
                        name="address"
                        value={storeInfo.address}
                        onChange={handleInputChange}
                        rows={2}
                        className="flex-1 focus:outline-none"
                        placeholder="123 Medical St, Health City, HC 12345"
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

export default EditStorePage;