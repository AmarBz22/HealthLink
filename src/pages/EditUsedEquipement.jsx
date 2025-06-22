import React, { useState, useEffect, useRef } from "react";
import { Save, X, Upload, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const EditUsedEquipmentPage = () => {
  const { id } = useParams(); // id is equipmentId
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [originalEquipmentData, setOriginalEquipmentData] = useState(null);
  const [modifiedFields, setModifiedFields] = useState({});
  const [equipmentData, setEquipmentData] = useState({
    product_id: id,
    product_name: "",
    description: "",
    price: "",
    inventory_price: "",
    stock: "",
    category: "",
    condition: "",
    images: [],
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
  // Track which existing images to delete
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const categories = [
    "Diagnostic Devices",       // ECG, ultrasound, thermometers
    "Surgical Instruments",     // Scalpels, forceps, scissors
    "Monitoring Equipment",     // BP monitors, oximeters, heart rate monitors
    "Therapeutic Equipment",    // Nebulizers, infusion pumps
    "Mobility Aids",            // Wheelchairs, walkers, crutches
    "Durable Medical Equipment"
  ];
  const conditions = ["excellent", "very good", "good", "fair", "poor"];

  useEffect(() => {
    const fetchEquipmentAndVerifyOwner = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Authentication required");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };

        // Fetch equipment data and user data in parallel
        const [equipmentResponse, userResponse] = await Promise.all([
          fetch(`http://192.168.43.101:8000/api/product/${id}?with_images=true`, {
            headers,
          }),
          fetch("http://192.168.43.101:8000/api/user", { headers }).catch(() => null),
        ]);

        if (!equipmentResponse.ok) {
          const errorData = await equipmentResponse.json();
          throw new Error(errorData.message || "Failed to fetch equipment data");
        }

        const equipment = await equipmentResponse.json();
        // Assume store_id is part of equipment data or fetch it separately
        const storeResponse = await fetch(
          `http://192.168.43.101:8000/api/store/${equipment.store_id}`,
          { headers }
        );

        if (!storeResponse.ok) {
          throw new Error("Failed to fetch store data");
        }

        const store = await storeResponse.json();

        // Check if current user is the owner
        if (userResponse && store.owner_id) {
          const user = await userResponse.json();
          if (store.owner_id === user.id) {
            setIsOwner(true);
          } else {
            setErrors({ general: "You don't have permission to edit this equipment" });
            navigate(`/used-equipment`);
            return;
          }
        } else {
          setErrors({ general: "Unable to verify ownership" });
          navigate(`/used-equipment`);
          return;
        }

        // Map API response to form fields
        const initialEquipmentData = {
          product_id: id,
          product_name: equipment.product_name || "",
          description: equipment.description || "",
          price: equipment.price || "",
          inventory_price: equipment.inventory_price || "",
          stock: equipment.stock || "",
          category: equipment.category || "Diagnostic Equipment",
          condition: equipment.condition || "Excellent",
          images: equipment.images || [],
        };

        setEquipmentData(initialEquipmentData);
        setOriginalEquipmentData(initialEquipmentData);

        // Set preview images if they exist
        if (equipment.images && equipment.images.length > 0) {
          setPreviewImages(
            equipment.images.map((img) => ({
              url: img.image_path,
              name: img.image_path.split("/").pop(),
              isExisting: true,
              id: img.id,
            }))
          );
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setErrors({ general: error.message || "Failed to load equipment data" });
        navigate(`/used-equipment/${id}`);
      }
    };

    fetchEquipmentAndVerifyOwner();
  }, [id, navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case "product_name":
        return value.trim() ? "" : "Equipment Name is required";
      case "price":
        if (!value) return "Price is required";
        if (parseFloat(value) <= 0) return "Price must be greater than 0";
        return "";
      case "stock":
        if (!value) return "Stock is required";
        if (parseInt(value) <= 0) return "Stock must be at least 1";
        return "";
      case "category":
        return value ? "" : "Category is required";
      case "condition":
        return value ? "" : "Condition is required";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEquipmentData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    setModifiedFields((prev) => ({
      ...prev,
      [name]: value !== originalEquipmentData?.[name] ? value : undefined,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newErrors = [];

    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        newErrors.push(`Image ${file.name} exceeds 10MB limit`);
        return false;
      }
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        newErrors.push(`Image ${file.name} must be JPEG, JPG, or PNG`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      setErrors((prev) => ({ ...prev, images: newErrors.length ? newErrors : undefined }));
      return;
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages((prev) => [
          ...prev,
          { url: reader.result, name: file.name, isExisting: false },
        ]);
      };
      reader.readAsDataURL(file);
    });

    setModifiedFields((prev) => ({ ...prev, images: true }));
    setErrors((prev) => ({ ...prev, images: undefined }));
  };

  const removeImage = (index) => {
    const imageToRemove = previewImages[index];

    if (imageToRemove.isExisting) {
      // Add to deletion list if it's an existing image
      setImagesToDelete((prev) => [...prev, imageToRemove.id]);
      setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Remove from preview and selected files if it's a new image
      const existingImagesCount = previewImages.filter(img => img.isExisting).length;
      const newImageIndex = index - existingImagesCount;
      
      setPreviewImages((prev) => prev.filter((_, i) => i !== index));
      setSelectedFiles((prev) => prev.filter((_, i) => i !== newImageIndex));
    }

    // Adjust current image index if necessary
    if (currentImageIndex >= previewImages.length - 1) {
      setCurrentImageIndex(Math.max(0, previewImages.length - 2));
    }

    // Clear file input if no images left
    if (previewImages.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setModifiedFields((prev) => ({ ...prev, images: true }));
  };

  const navigateImage = (direction) => {
    setCurrentImageIndex((prev) => {
      if (direction === "prev") {
        return prev === 0 ? previewImages.length - 1 : prev - 1;
      } else {
        return prev === previewImages.length - 1 ? 0 : prev + 1;
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(equipmentData).forEach((key) => {
      const error = validateField(key, equipmentData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwner || !validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication required");

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("product_name", equipmentData.product_name);
      formData.append("description", equipmentData.description || "");
      formData.append("price", equipmentData.price);
      formData.append("inventory_price", equipmentData.inventory_price || "");
      formData.append("stock", equipmentData.stock);
      formData.append("category", equipmentData.category);
      formData.append("condition", equipmentData.condition);

      // Add new images
      selectedFiles.forEach((file) => {
        formData.append("images[]", file);
      });

      // Send images to delete (your backend expects 'delete_images')
      if (imagesToDelete.length > 0) {
        imagesToDelete.forEach((imageId) => {
          formData.append("delete_images[]", imageId);
        });
      }

      const response = await fetch(`http://192.168.43.101:8000/api/product/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
        }
        throw new Error(errorData.message || "Failed to update equipment");
      }

      navigate(`/used-equipment`);
    } catch (error) {
      console.error("Error updating equipment:", error);
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Failed to update equipment",
      }));
    } finally {
      setIsSubmitting(false);
    }
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
          <p className="text-gray-600 mb-4">
            {errors.general || "You don't have permission to edit this equipment."}
          </p>
          <button
            onClick={() => navigate(`/used-equipment/${id}`)}
            className="px-4 py-2 bg-[#00796B] text-white rounded-md hover:bg-[#00695C] transition-colors"
          >
            Return to Equipment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Edit Used Equipment</h1>
          <button
            onClick={() => navigate(`/used-equipment/${id}`)}
            className="flex items-center text-gray-600 hover:text-[#00796B] transition-colors"
          >
            <X className="mr-1" /> Cancel
          </button>
        </div>

        {errors.general && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Equipment Information Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-[#00796B] border-b pb-2">
                Equipment Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Name*
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={equipmentData.product_name}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B] ${
                    errors.product_name
                      ? "border-red-500"
                      : isFieldModified("product_name")
                      ? "border-[#00796B] bg-[#E8F5E9]"
                      : "border-gray-300"
                  }`}
                  required
                  minLength="3"
                  maxLength="255"
                />
                {errors.product_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.product_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  name="category"
                  value={equipmentData.category}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B] ${
                    errors.category
                      ? "border-red-500"
                      : isFieldModified("category")
                      ? "border-[#00796B] bg-[#E8F5E9]"
                      : "border-gray-300"
                  }`}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition*
                </label>
                <select
                  name="condition"
                  value={equipmentData.condition}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B] ${
                    errors.condition
                      ? "border-red-500"
                      : isFieldModified("condition")
                      ? "border-[#00796B] bg-[#E8F5E9]"
                      : "border-gray-300"
                  }`}
                  required
                >
                  <option value="">Select condition</option>
                  {conditions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
                {errors.condition && (
                  <p className="text-red-500 text-xs mt-1">{errors.condition}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={equipmentData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B] ${
                    isFieldModified("description")
                      ? "border-[#00796B] bg-[#E8F5E9]"
                      : "border-gray-300"
                  }`}
                  maxLength="500"
                />
              </div>
            </div>

            {/* Pricing & Inventory Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-[#00796B] border-b pb-2">
                Pricing & Inventory
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (DZ)*
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    min="0.01"
                    step="0.01"
                    value={equipmentData.price}
                    onChange={handleChange}
                    className={`w-full border rounded-md pl-7 pr-3 py-2 focus:ring-[#00796B] focus:border-[#00796B] ${
                      errors.price
                        ? "border-red-500"
                        : isFieldModified("price")
                        ? "border-[#00796B] bg-[#E8F5E9]"
                        : "border-gray-300"
                    }`}
                    required
                  />
                </div>
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity*
                </label>
                <input
                  type="number"
                  name="stock"
                  min="1"
                  value={equipmentData.stock}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 focus:ring-[#00796B] focus:border-[#00796B] ${
                    errors.stock
                      ? "border-red-500"
                      : isFieldModified("stock")
                      ? "border-[#00796B] bg-[#E8F5E9]"
                      : "border-gray-300"
                  }`}
                  required
                />
                {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Images
                </label>
                {errors.images && (
                  <div className="mb-2">
                    {errors.images.map((error, index) => (
                      <p key={index} className="text-red-500 text-xs">{error}</p>
                    ))}
                  </div>
                )}
                {previewImages.length > 0 ? (
                  <div className="space-y-2">
                    <div className="relative w-full h-48 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={previewImages[currentImageIndex].url}
                        alt={`Equipment image ${currentImageIndex + 1}`}
                        className="w-full h-full object-contain"
                      />

                      {/* Navigation arrows */}
                      {previewImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => navigateImage("prev")}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow-md hover:bg-white"
                          >
                            <ChevronLeft className="text-gray-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => navigateImage("next")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow-md hover:bg-white"
                          >
                            <ChevronRight className="text-gray-700" />
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
                            className={`w-2 h-2 rounded-full ${
                              currentImageIndex === index ? "bg-[#00796B]" : "bg-white/80"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeImage(currentImageIndex)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm border border-gray-300 hover:bg-gray-50"
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>

                    <label className="block">
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-[#00796B] transition-colors ${
                          isFieldModified("images")
                            ? "border-[#00796B] bg-[#E8F5E9]"
                            : "border-gray-300"
                        }`}
                      >
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-1 text-sm text-gray-600">Click to upload more images</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
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
                        isFieldModified("images")
                          ? "border-[#00796B] bg-[#E8F5E9]"
                          : "border-gray-300"
                      }`}
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
              type="submit"
              disabled={isSubmitting || !hasChanges()}
              className="flex items-center px-4 py-2 bg-[#00796B] text-white rounded-md hover:bg-[#00695C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating Equipment...
                </>
              ) : (
                <>
                  <Save className="mr-2" /> Update Equipment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUsedEquipmentPage;