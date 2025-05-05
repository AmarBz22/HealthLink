import React, { useState, useRef } from "react";
import { FiSave, FiX, FiUpload, FiTrash2 } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const AddProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [productData, setProductData] = useState({
    store_id: id,
    product_name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Medical Devices",
    "Medications",
    "Wellness Products",
    "Personal Care",
    "First Aid",
    "Health Supplements"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication required");
  
      // Validate required fields
      if (!productData.product_name) throw new Error("Product Name is required");
      if (!productData.price) throw new Error("Price is required");
      if (!productData.stock) throw new Error("Stock is required");
      if (!productData.category) throw new Error("Category is required");
  
      const formData = new FormData();
      formData.append("store_id", productData.store_id);
      formData.append("product_name", productData.product_name);
      formData.append("description", productData.description || "");
      formData.append("price", productData.price);
      formData.append("stock", productData.stock);
      formData.append("category", productData.category);
      formData.append("inventory_price", "");
      
      if (selectedFile) {
        formData.append("image", selectedFile);
      }
  
      const headers = {
        "Authorization": `Bearer ${token}`,
        // Let browser set Content-Type with boundary for FormData
      };
  
      const response = await axios.post(
        `http://localhost:8000/api/product`, // Note singular endpoint
        formData,
        { headers }
      );
  
      toast.success("Product created successfully");
      navigate(`/store/${productData.store_id}`);
    } catch (error) {
      console.error("Error creating product:", error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         "Failed to create product";
      toast.error(errorMessage);
      
      // Specific error for store_id validation
      if (error.response?.data?.errors?.store_id) {
        toast.error("Invalid store selection");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
          <Link 
            to={`/store/${id}`} // Changed from /store to /store/${id}
            className="flex items-center text-gray-600 hover:text-[#00796B] transition-colors"
          >
            <FiX className="mr-1" /> Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-[#00796B] border-b pb-2">Product Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
                <input
                  type="text"
                  name="product_name"
                  value={productData.product_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <select
                  name="category"
                  value={productData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B]"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={productData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B]"
                />
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-[#00796B] border-b pb-2">Pricing & Inventory</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (DZ)*</label>
                <input
                  type="number"
                  name="price"
                  min="0.01"
                  step="0.01"
                  value={productData.price}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity*</label>
                <input
                  type="number"
                  name="stock"
                  min="1"
                  value={productData.stock}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B]"
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                {previewImage ? (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Product preview"
                      className="h-40 w-full object-contain rounded-md border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm border border-gray-300 hover:bg-gray-50"
                    >
                      <FiTrash2 className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#00796B] transition-colors"
                    >
                      <FiUpload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-1 text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 2MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleImageChange}
                      accept="image/png, image/jpeg, image/jpg"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-[#00796B] text-white rounded-md hover:bg-[#00695C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" /> Save Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;