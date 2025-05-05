import React, { useState, useRef, useEffect } from "react";
import { FiSave, FiX, FiUpload, FiTrash2 } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const EditProductPage = () => {
  const { storeId, productId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  // Add states for original data and modified fields tracking
  const [originalProductData, setOriginalProductData] = useState(null);
  const [modifiedFields, setModifiedFields] = useState({});

  const [productData, setProductData] = useState({
    store_id: storeId,
    product_id: productId,
    product_name: "",
    description: "",
    price: "",
    stock: "",
    category: "Medical Devices",
    image_url: ""
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    "Medical Devices",
    "Medications",
    "Wellness Products",
    "Personal Care",
    "First Aid",
    "Health Supplements"
  ];

  useEffect(() => {
    const fetchProductAndVerifyOwner = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Authentication required");
        }

        const headers = {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        };

        // Fetch product data and user data in parallel
        const [productResponse, userResponse] = await Promise.all([
          axios.get(`http://localhost:8000/api/product/${productId}`, { headers }),
          axios.get('http://localhost:8000/api/user', { headers }).catch(() => null)
        ]);

        const product = productResponse.data // Access first item in array
        const storeResponse = await axios.get(`http://localhost:8000/api/store/${storeId}`, { headers });
        console.log(productResponse)
        console.log(storeResponse)
        console.log(userResponse)
        // Check if current user is the owner
        if (userResponse && storeResponse.data.owner_id === userResponse.data.id) {
          setIsOwner(true);
        } else {
          toast.error("You don't have permission to edit this product");
          navigate(`/store/${storeId}`);
          return;
        }

        // Map API response to form fields
        const initialProductData = {
          store_id: storeId,
          product_id: productId,
          product_name: product.product_name,
          description: product.description,
          price: product.price, // Map  to price
          stock: product.stock,
          category: product.category,
          image_url: product.image
        };

        setProductData(initialProductData);
        setOriginalProductData(initialProductData); // Store original data

        if (product.image) {
          setPreviewImage(product.image);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
        toast.error(error.response?.data?.message || "Failed to load product data");
        navigate(`/store/${storeId}`);
      }
    };

    fetchProductAndVerifyOwner();
  }, [productId, storeId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setProductData(prev => ({ ...prev, [name]: value }));
    
    // Track modified fields by comparing with original data
    setModifiedFields(prev => ({
      ...prev,
      [name]: value !== originalProductData[name] ? value : undefined
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwner) return;
    
    setIsSubmitting(true);
  
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
  
      const formData = new FormData();
      
      // Always include ALL required fields
      formData.append("product_name", productData.product_name || "");
      formData.append("category", productData.category || "Medical Devices");
      formData.append("price", productData.price || "0");
      formData.append("stock", productData.stock || "0");
      
      // Include optional fields
      if (productData.description) {
        formData.append("description", productData.description);
      }
      
      // Handle image
      if (selectedFile) {
        formData.append("image", selectedFile);
      } else if (modifiedFields.image_url === null) {
        formData.append("remove_image", "1");
      }
  
      // Debug: Log what we're sending
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
  
      const response = await axios.post(
        `http://localhost:8000/api/product/${productId}`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
          params: {
            _method: "PUT" // Laravel's way to handle PUT requests via POST
          }
        }
      );
  
      toast.success("Product updated successfully");
      navigate(`/store/${storeId}`);
    } catch (error) {
      console.error("Error updating product:", error);
      
      // Display validation errors to user
      if (error.response?.status === 422) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join('\n');
        toast.error(errorMessages);
      } else {
        toast.error(error.response?.data?.message || "Failed to update product");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      setSelectedFile(file);
      setModifiedFields(prev => ({ ...prev, image_url: null })); // Mark image as changed
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast.error("Image size should be less than 2MB");
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setModifiedFields(prev => ({ ...prev, image_url: null })); // Mark image as removed
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Helper function to check if field is modified
  const isFieldModified = (fieldName) => {
    return modifiedFields[fieldName] !== undefined;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Unauthorized Access</h2>
          <p className="text-gray-600 mb-4">You don't have permission to edit this product.</p>
          <button
            onClick={() => navigate(`/store/${storeId}`)}
            className="px-4 py-2 bg-[#00796B] text-white rounded-md hover:bg-[#00695C] transition-colors"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
          <Link 
            to={`/store/${storeId}`} 
            className="flex items-center text-gray-600 hover:text-[#00796B] transition-colors"
          >
            <FiX className="mr-1" /> Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-[#00796B] border-b pb-2">Product Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
                <input
                  type="text"
                  name="product_name"
                  value={productData.product_name}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B] ${
                    isFieldModified('product_name') 
                      ? 'border-[#00796B] bg-[#E8F5E9]' 
                      : 'border-gray-300'
                  }`}
                  required
                  minLength="3"
                  maxLength="255"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <select
                  name="category"
                  value={productData.category}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B] ${
                    isFieldModified('category') 
                      ? 'border-[#00796B] bg-[#E8F5E9]' 
                      : 'border-gray-300'
                  }`}
                  required
                >
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
                  className={`w-full border rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B] ${
                    isFieldModified('description') 
                      ? 'border-[#00796B] bg-[#E8F5E9]' 
                      : 'border-gray-300'
                  }`}
                  maxLength="500"
                />
              </div>
            </div>

            {/* Pricing & Inventory Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-[#00796B] border-b pb-2">Pricing & Inventory</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)*</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={productData.price}
                    onChange={handleChange}
                    className={`w-full border rounded-md pl-7 pr-3 py-2 focus:ring-[#00796B] focus:border-[#00796B] ${
                      isFieldModified('price') 
                        ? 'border-[#00796B] bg-[#E8F5E9]' 
                        : 'border-gray-300'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity*</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={productData.stock}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B] ${
                    isFieldModified('stock') 
                      ? 'border-[#00796B] bg-[#E8F5E9]' 
                      : 'border-gray-300'
                  }`}
                  required
                />
              </div>

              {/* Image Upload Section */}
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
                      aria-label="Remove image"
                    >
                      <FiTrash2 className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <div 
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-[#00796B] transition-colors ${
                        isFieldModified('image_url') 
                          ? 'border-[#00796B] bg-[#E8F5E9]' 
                          : 'border-gray-300'
                      }`}
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
                      aria-label="Product image upload"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting || Object.keys(modifiedFields).length === 0}
              className="flex items-center px-4 py-2 bg-[#00796B] text-white rounded-md hover:bg-[#00695C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" /> Update Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;