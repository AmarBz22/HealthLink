import React, { useState, useRef, useEffect } from "react";
import { FiSave, FiX, FiUpload, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const EditProductPage = () => {
  const { storeId, productId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [originalProductData, setOriginalProductData] = useState(null);
  const [modifiedFields, setModifiedFields] = useState({});
  const [imagesToDelete, setImagesToDelete] = useState([]); // Track images to delete

  const [productData, setProductData] = useState({
    store_id: storeId,
    product_id: productId,
    product_name: "",
    description: "",
    price: "",
    inventory_price: "",
    stock: "",
    category: "Medical Devices",
    type: "new",
    images: []
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    "Medical Equipment",
    "Pharmaceuticals",
    "Personal Protective Equipment",
    "Home Healthcare Devices",
    "Health & Wellness",
    "First Aid Supplies"
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

        const [productResponse, userResponse] = await Promise.all([
          axios.get(`http://192.168.43.102:8000/api/product/${productId}?with_images=true`, { headers }),
          axios.get('http://192.168.43.102:8000/api/user', { headers }).catch(() => null)
        ]);

        const product = productResponse.data;
        const storeResponse = await axios.get(`http://192.168.43.102:8000/api/store/${storeId}`, { headers });

        if (userResponse && storeResponse.data.owner_id === userResponse.data.id) {
          setIsOwner(true);
        } else {
          toast.error("You don't have permission to edit this product");
          navigate(`/store/${storeId}`);
          return;
        }

        const initialProductData = {
          store_id: storeId,
          product_id: productId,
          product_name: product.product_name,
          description: product.description,
          price: product.price,
          inventory_price: product.inventory_price || "",
          stock: product.stock,
          category: product.category,
          type: product.type || "new",
          images: product.images || []
        };

        setProductData(initialProductData);
        setOriginalProductData(initialProductData);

        // Set preview images with proper identification
        if (product.images && product.images.length > 0) {
          setPreviewImages(product.images.map(img => ({
            url: img.image_path,
            name: img.image_path.split('/').pop(),
            isExisting: true,
            imageId: img.id, // Store the database ID for existing images
            fileIndex: null // Not applicable for existing images
          })));
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
    
    setModifiedFields(prev => ({
      ...prev,
      [name]: value !== originalProductData?.[name] ? value : undefined
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwner) return;
    
    setIsSubmitting(true);
  
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication required");

      if (productData.type === 'inventory' && !productData.inventory_price) {
        throw new Error("Inventory price is required for inventory products");
      }

      const formData = new FormData();
      
      formData.append("_method", "PUT");
      formData.append("store_id", productData.store_id);
      formData.append("product_name", productData.product_name);
      formData.append("category", productData.category);
      formData.append("price", productData.price);
      formData.append("stock", productData.stock);
      formData.append("type", productData.type);
      
      if (productData.description) formData.append("description", productData.description);
      if (productData.inventory_price) formData.append("inventory_price", productData.inventory_price);
      
      // Add new images
      selectedFiles.forEach(file => {
        formData.append("images[]", file);
      });
      
      // Add images to delete
      if (imagesToDelete.length > 0) {
        imagesToDelete.forEach(imageId => {
          formData.append("delete_images[]", imageId);
        });
      }

      const response = await axios.post(
        `http://192.168.43.102:8000/api/product/${productId}`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      toast.success("Product updated successfully");
      navigate(`/store/${storeId}`);
    } catch (error) {
      console.error("Error updating product:", error);
      
      if (error.response?.status === 422) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join('\n');
        toast.error(errorMessages);
      } else {
        toast.error(error.response?.data?.message || error.message || "Failed to update product");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Image ${file.name} exceeds 10MB limit`);
        return false;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        toast.error(`Image ${file.name} must be JPEG, JPG, or PNG`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Add to selected files
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Create previews for new files
    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, { 
          url: reader.result, 
          name: file.name,
          isExisting: false,
          imageId: null,
          fileIndex: selectedFiles.length + index // Track which file this preview corresponds to
        }]);
      };
      reader.readAsDataURL(file);
    });

    setModifiedFields(prev => ({ ...prev, images: true }));
  };

  const removeImage = (index) => {
    const imageToRemove = previewImages[index];
    
    if (imageToRemove.isExisting) {
      // For existing images, add to delete list
      setImagesToDelete(prev => [...prev, imageToRemove.imageId]);
    } else {
      // For new images, remove from selectedFiles
      const fileIndex = imageToRemove.fileIndex;
      if (fileIndex !== null) {
        setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex));
        
        // Update fileIndex for remaining new images
        setPreviewImages(prev => prev.map(img => {
          if (!img.isExisting && img.fileIndex > fileIndex) {
            return { ...img, fileIndex: img.fileIndex - 1 };
          }
          return img;
        }));
      }
    }
    
    // Remove from preview images
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    
    // Adjust current image index if necessary
    if (currentImageIndex >= previewImages.length - 1) {
      setCurrentImageIndex(Math.max(0, previewImages.length - 2));
    }

    // Reset file input if all images are removed
    if (previewImages.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setModifiedFields(prev => ({ ...prev, images: true }));
  };

  const navigateImage = (direction) => {
    setCurrentImageIndex(prev => {
      if (direction === 'prev') {
        return prev === 0 ? previewImages.length - 1 : prev - 1;
      } else {
        return prev === previewImages.length - 1 ? 0 : prev + 1;
      }
    });
  };

  const isFieldModified = (fieldName) => {
    return modifiedFields[fieldName] !== undefined;
  };

  const hasChanges = () => {
    return Object.keys(modifiedFields).length > 0 || selectedFiles.length > 0 || imagesToDelete.length > 0;
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

              {productData.type === 'inventory' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inventory Price (USD)*</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                    <input
                      type="number"
                      name="inventory_price"
                      min="0"
                      step="0.01"
                      value={productData.inventory_price}
                      onChange={handleChange}
                      className={`w-full border rounded-md pl-7 pr-3 py-2 focus:ring-[#00796B] focus:border-[#00796B] ${
                        isFieldModified('inventory_price') 
                          ? 'border-[#00796B] bg-[#E8F5E9]' 
                          : 'border-gray-300'
                      }`}
                      required={productData.type === 'inventory'}
                    />
                  </div>
                </div>
              )}

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
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                {previewImages.length > 0 ? (
                  <div className="space-y-2">
                    <div className="relative w-full h-48 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={previewImages[currentImageIndex].url}
                        alt={`Product image ${currentImageIndex + 1}`}
                        className="w-full h-full object-contain"
                      />
                      
                      {/* Navigation arrows */}
                      {previewImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => navigateImage('prev')}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow-md hover:bg-white"
                          >
                            <FiChevronLeft className="text-gray-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => navigateImage('next')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow-md hover:bg-white"
                          >
                            <FiChevronRight className="text-gray-700" />
                          </button>
                        </>
                      )}
                      
                      {/* Image indicators */}
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                        {previewImages.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full ${currentImageIndex === index ? 'bg-[#00796B]' : 'bg-white/80'}`}
                          />
                        ))}
                      </div>
                      
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeImage(currentImageIndex)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm border border-gray-300 hover:bg-gray-50"
                      >
                        <FiTrash2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    
                    <label className="block">
                      <div 
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-[#00796B] transition-colors ${
                          isFieldModified('images') 
                            ? 'border-[#00796B] bg-[#E8F5E9]' 
                            : 'border-gray-300'
                        }`}
                      >
                        <FiUpload className="mx-auto h-8 w-8 text-gray-400" />
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
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-[#00796B] transition-colors ${
                        isFieldModified('images') 
                          ? 'border-[#00796B] bg-[#E8F5E9]' 
                          : 'border-gray-300'
                      }`}
                    >
                      <FiUpload className="mx-auto h-8 w-8 text-gray-400" />
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
              type="submit"
              disabled={isSubmitting || !hasChanges()}
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