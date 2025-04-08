import { useState, useEffect } from "react";
import { FiUpload, FiSave, FiPlusCircle, FiMapPin, FiPhone, FiMail, FiX, FiTrash2 } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const StoreManagementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  
  // Store Information State
  const [storeInfo, setStoreInfo] = useState({
    name: "",
    description: "",
    contact: {
      phone: "",
      email: "",
      address: ""
    },
    specialties: [],
    certifications: [],
    logo: null,
    is_verified: false
  });

  // Fetch store data if in edit mode
  useEffect(() => {
    if (id) {
      const fetchStore = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get(`/api/stores/`);
          setStoreInfo({
            ...response.data,
            logo: response.data.logo_url || null
          });
        } catch (error) {
          toast.error("Failed to load store data");
          console.error("Error fetching store:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStore();
    }
  }, [id]);

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoreInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setStoreInfo(prev => ({
      ...prev,
      contact: { ...prev.contact, [name]: value }
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setStoreInfo(prev => ({
        ...prev,
        logo: URL.createObjectURL(file)
      }));
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
      formData.append('name', storeInfo.name);
      formData.append('description', storeInfo.description);
      formData.append('contact[phone]', storeInfo.contact.phone);
      formData.append('contact[email]', storeInfo.contact.email);
      formData.append('contact[address]', storeInfo.contact.address);
      formData.append('is_verified', storeInfo.is_verified);
      
      storeInfo.specialties.forEach(spec => {
        formData.append('specialties[]', spec);
      });
      
      storeInfo.certifications.forEach(cert => {
        formData.append('certifications[]', cert);
      });

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      let response;
      if (id) {
        // Update existing store
        response = await axios.put(`/api/stores/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success("Store updated successfully");
      } else {
        // Create new store
        response = await axios.post('/api/stores', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success("Store created successfully");
        navigate(`/stores/${response.data.id}`);
      }
    } catch (error) {
      console.error("Error saving store:", error);
      toast.error(error.response?.data?.message || "Failed to save store");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <main className="p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {id ? "Edit Medical Store" : "Create New Medical Store"}
            </h1>
            <button 
              onClick={handleSubmit}
              disabled={isLoading}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <FiSave className="mr-2" /> 
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Store Information Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Store Profile</h2>
            
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="MedEquip Solutions"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={storeInfo.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Specializing in diagnostic imaging equipment and surgical supplies..."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Specialties</label>
                  <div className="space-y-2">
                    {storeInfo.specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={specialty}
                          onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Cardiology, Radiology"
                        />
                        <button
                          type="button"
                          onClick={() => removeSpecialty(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSpecialty}
                      className="flex items-center text-sm text-blue-500 hover:text-blue-700"
                    >
                      <FiPlusCircle className="mr-1" /> Add Specialty
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
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center">
                        {storeInfo.logo ? (
                          <div className="relative">
                            <img 
                              src={storeInfo.logo} 
                              alt="Store logo" 
                              className="w-20 h-20 object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setStoreInfo(prev => ({ ...prev, logo: null }));
                                setLogoFile(null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <FiX size={14} />
                            </button>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                    <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
                      <FiPhone className="text-gray-400 mr-2" />
                      <input
                        type="tel"
                        name="phone"
                        value={storeInfo.contact.phone}
                        onChange={handleContactChange}
                        className="flex-1 focus:outline-none focus:ring-blue-500"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
                      <FiMail className="text-gray-400 mr-2" />
                      <input
                        type="email"
                        name="email"
                        value={storeInfo.contact.email}
                        onChange={handleContactChange}
                        className="flex-1 focus:outline-none focus:ring-blue-500"
                        placeholder="Email address"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start border border-gray-300 rounded-md px-3 py-2">
                      <FiMapPin className="text-gray-400 mr-2 mt-1" />
                      <textarea
                        name="address"
                        value={storeInfo.contact.address}
                        onChange={handleContactChange}
                        rows={2}
                        className="flex-1 focus:outline-none focus:ring-blue-500"
                        placeholder="Physical address"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Certifications Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Medical Certifications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['FDA Approved', 'CE Marked', 'ISO 13485', 'GMP Certified', 'WHO Prequalified'].map(cert => (
                <label key={cert} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={storeInfo.certifications.includes(cert)}
                    onChange={() => {
                      setStoreInfo(prev => ({
                        ...prev,
                        certifications: prev.certifications.includes(cert)
                          ? prev.certifications.filter(c => c !== cert)
                          : [...prev.certifications, cert]
                      }));
                    }}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">{cert}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Verification Toggle (Admin Only) */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Store Verification</h2>
                <p className="text-sm text-gray-500">
                  {storeInfo.is_verified 
                    ? "This store is verified and publicly visible" 
                    : "This store is not verified yet"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={storeInfo.is_verified}
                  onChange={(e) => setStoreInfo(prev => ({
                    ...prev,
                    is_verified: e.target.checked
                  }))}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StoreManagementPage;