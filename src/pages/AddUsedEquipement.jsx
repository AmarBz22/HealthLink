import React, { useState, useRef } from "react";
import { Save, X, Upload, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const AddUsedEquipmentPage = () => {
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [equipmentData, setEquipmentData] = useState({
    store_id: id,
    product_name: '',
    description: '',
    price: '',
    inventory_price: '',
    stock: '',
    category: '',
    condition: ''
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // New state for field errors
  const [errors, setErrors] = useState({});
  // New state for general form submission errors
  const [submissionError, setSubmissionError] = useState('');

  const categories = [
    "Diagnostic Equipment", "Surgical Instruments", "Patient Monitoring",
    "Laboratory Equipment", "Imaging Equipment", "Rehabilitation Equipment",
    "Dental Equipment", "Emergency Equipment", "Hospital Furniture",
    "Other Medical Equipment"
  ];

  const conditions = ["Excellent", "Very Good", "Good", "Fair", "Needs Repair"];

  const validateField = (name, value) => {
    switch (name) {
      case 'product_name':
        return value.trim() ? '' : 'Equipment Name is required';
      case 'price':
        if (!value) return 'Price is required';
        if (parseFloat(value) <= 0) return 'Price must be greater than 0';
        return '';
      case 'stock':
        if (!value) return 'Stock is required';
        if (parseInt(value) <= 0) return 'Stock must be at least 1';
        return '';
      case 'category':
        return value ? '' : 'Category is required';
      case 'condition':
        return value ? '' : 'Condition is required';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEquipmentData(prev => ({ ...prev, [name]: value }));
    // Validate field on change
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newErrors = [];

    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        newErrors.push(`Image ${file.name} exceeds 10MB limit`);
        return false;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        newErrors.push(`Image ${file.name} must be JPEG, JPG, or PNG`);
        return false;
      }
      return true;
    });

    setErrors(prev => ({ ...prev, images: newErrors.length ? newErrors : undefined }));

    if (validFiles.length === 0) return;

    setSelectedFiles(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, { url: reader.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(equipmentData).forEach(key => {
      const error = validateField(key, equipmentData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmissionError('');
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication required");

      const formData = new FormData();
      formData.append("store_id", equipmentData.store_id);
      formData.append("product_name", equipmentData.product_name);
      formData.append("description", equipmentData.description || "");
      formData.append("price", equipmentData.price);
      formData.append("inventory_price", equipmentData.inventory_price || "");
      formData.append("stock", equipmentData.stock);
      formData.append("category", equipmentData.category);
      formData.append("condition", equipmentData.condition);

      selectedFiles.forEach(file => {
        formData.append("images[]", file);
      });

      const headers = {
        "Authorization": `Bearer ${token}`,
      };

      const response = await fetch(
        `http://localhost:8000/api/product/used-equipment`,
        {
          method: 'POST',
          headers,
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to add used equipment");
      }

      navigate(`/used-equipment`);
    } catch (error) {
      setSubmissionError(error.message || "Failed to add used equipment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Add Used Equipment</h1>
          <button 
            onClick={() => navigate(`/store/${id}`)}
            className="flex items-center text-gray-600 hover:text-[#00796B] transition-colors"
          >
            <X className="mr-1" /> Cancel
          </button>
        </div>

        {submissionError && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {submissionError}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-[#00796B] border-b pb-2">Equipment Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name*</label>
                <input
                  type="text"
                  name="product_name"
                  value={equipmentData.product_name}
                  onChange={handleChange}
                  className={`w-full border ${errors.product_name ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B]`}
                />
                {errors.product_name && <p className="text-red-500 text-xs mt-1">{errors.product_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <select
                  name="category"
                  value={equipmentData.category}
                  onChange={handleChange}
                  className={`w-full border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B]`}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition*</label>
                <select
                  name="condition"
                  value={equipmentData.condition}
                  onChange={handleChange}
                  className={`w-full border ${errors.condition ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B]`}
                >
                  <option value="">Select condition</option>
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
                {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={equipmentData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium text-[#00796B] border-b pb-2">Pricing</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (DZ)*</label>
                <input
                  type="number"
                  name="price"
                  min="0.01"
                  step="0.01"
                  value={equipmentData.price}
                  onChange={handleChange}
                  className={`w-full border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:ring-[#00796B] `}
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity*</label>
                <input
                  type="number"
                  name="stock"
                  min="1"
                  value={equipmentData.stock}
                  onChange={handleChange}
                  className={`w-full border ${errors.stock ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B]`}
                />
                {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Images</label>
                {errors.images && (
                  <div className="mb-2">
                    {errors.images.map((error, index) => (
                      <p key={index} className="text-red-500 text-xs">{error}</p>
                    ))}
                  </div>
                )}
                {previewImages.length > 0 ? (
                  <div className="space-y-2">
                    {previewImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.url}
                          alt={`Equipment preview ${index}`}
                          className="h-40 w-full object-contain rounded-md border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 right-2 bg-white rounded-full p-1 shadow-sm border border-gray-300 hover:bg-gray-50"
                        >
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                    <label className="block">
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#00796B] transition-colors"
                      >
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-1 text-sm text-gray-600">
                          Click to upload more images
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG up to 10MB each
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleImageChange}
                        accept="image/png, image/jpeg, image/jpg"
                        multiple
                      />
                    </label>
                  </div>
                ) : (
                  <label className="block">
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#00796B] transition-colors"
                    >
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-1 text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 10MB each (multiple allowed)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleImageChange}
                      accept="image/png, image/jpeg, image/jpg"
                      multiple
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-[#00796B] text-white rounded-md hover:bg-[#00695C] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Equipment...
                </>
              ) : (
                <>
                  <Save className="mr-2" /> Add Equipment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUsedEquipmentPage;