import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSave, FiX, FiUpload, FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiMapPin, FiShield, FiKey } from "react-icons/fi";
import axios from "axios";

const EditProfilePage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [user, setUser] = useState({
        id: null,
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        wilaya: "",
        role: "",
        password: "",
        profile_image: null
    });

    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageError, setImageError] = useState(false);

    const getAuthToken = () => {
        return localStorage.getItem('authToken');
    };

    useEffect(() => {
        const fetchUserData = async () => {
          try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:8000/api/user', {
              headers: {
                Authorization: `Bearer ${authToken}`,
                Accept: 'application/json',
              },
            });
      
            console.log("Axios response:", response);
      
            if (response.data) {
              setUser({
                id: response.data.id,
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                email: response.data.email,
                phone_number: response.data.phone_number,
                wilaya: response.data.wilaya,
                role: response.data.role,
                profile_image: response.data.profile_image || null,
                password: "********",
              });
    
              // Set image preview if profile image exists
              if (response.data.profile_image) {
                // Reset any previous image errors
                setImageError(false);
                
                // Use the image URL directly as provided by the API
                const imageUrl = response.data.profile_image;
                console.log("Setting image preview URL:", imageUrl);
                setImagePreview(imageUrl);
              }
            }
          } catch (error) {
            console.error("Error fetching user data with Axios:", error);
          } finally {
            setLoading(false);
          }
        };
      
        fetchUserData();
      }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        showPasswordConfirmation();
    };

    const showPasswordConfirmation = () => {
        setShowConfirmation(true);
        setConfirmPassword("");
        setPasswordError("");
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, JPG, GIF, SVG)');
            return;
        }

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB');
            return;
        }

        // Create a preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setImageError(false); // Reset error state when loading new image
        };
        reader.readAsDataURL(file);

        // Upload the image
        await uploadProfileImage(file);
    };

    const uploadProfileImage = async (file) => {
        setUploadingImage(true);
        try {
            const authToken = getAuthToken();
            if (!authToken) {
                throw new Error('No authentication token found');
            }
    
            const formData = new FormData();
            formData.append('image', file);
    
            const response = await axios.post(
                'http://localhost:8000/api/profile/upload-image',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json'
                    }
                }
            );
    
            if (response.data) {
                console.log('Profile image upload response:', response.data);
                
                // Use the profile image URL directly as returned by the API
                const imageUrl = response.data.profile_image;
                
                // Update user state with the new profile image URL
                setUser(prev => ({
                    ...prev,
                    profile_image: imageUrl
                }));
                
                // No need to modify the URL - use it as is
                setImagePreview(imageUrl);
                setImageError(false);
                
                console.log('Profile image updated successfully with URL:', imageUrl);
            }
        } catch (error) {
            console.error('Error uploading profile image:', error);
            alert('Failed to upload profile image. Please try again.');
            setImageError(true);
        } finally {
            setUploadingImage(false);
        }
    };

    const verifyPassword = async () => {
        if (!confirmPassword) {
            setPasswordError("Please enter your password");
            return;
        }
    
        try {
            const authToken = getAuthToken();
            if (!authToken) {
                throw new Error('No authentication token found');
            }
    
            // Prepare the update data
            const updateData = {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone_number: user.phone_number,
                wilaya: user.wilaya,
                current_password: confirmPassword
            };
    
            // Only include password if it's being changed (not the placeholder and not empty)
            if (user.password && user.password !== "********") {
                updateData.password = user.password;
            }
    
            const response = await axios.put('http://localhost:8000/api/user/update', 
                updateData, 
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );
    
            if (response.data.success) {
                navigate('/profile');
            }
        } catch (error) {
            console.error("Update failed:", error);
            if (error.response?.data?.errors) {
                // Handle validation errors from Laravel
                const errors = error.response.data.errors;
                const firstError = Object.values(errors)[0][0];
                setPasswordError(firstError || "Validation error");
            } else {
                setPasswordError(error.response?.data?.message || "Invalid password. Please try again.");
            }
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-4 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between mb-6">
                <button 
                    onClick={() => navigate('/profile')}
                    className="flex items-center text-[#00796B] hover:text-[#00695C]"
                >
                    <FiX className="mr-1" /> Cancel
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
                <button
                    type="submit"
                    form="profileForm"
                    className="flex items-center px-4 py-2 bg-[#00796B] text-white rounded-md hover:bg-[#00695C] transition-colors"
                >
                    <FiSave className="mr-2" /> Save
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <form id="profileForm" onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center">
                        <div 
                            className="w-32 h-32 rounded-full border-4 border-[#B2DFDB] bg-gray-200 flex items-center justify-center relative overflow-hidden cursor-pointer group"
                            onClick={handleImageClick}
                        >
                            {uploadingImage ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                                </div>
                            ) : (
                                <>
                                    {imagePreview && !imageError ? (
                                        <img 
                                            src={imagePreview} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                console.error("Image failed to load:", e.target.src);
                                                setImageError(true);
                                            }}
                                        />
                                    ) : (
                                        <FiUser className="text-4xl text-gray-400" />
                                    )}
                                    <div className="absolute inset-0  group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300">
                                        <FiUpload className="text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300" />
                                    </div>
                                </>
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                            accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                        />
                        <p className="mt-2 text-sm text-[#00796B] cursor-pointer hover:underline" onClick={handleImageClick}>
                            Change Profile Picture
                        </p>
                        <h3 className="mt-3 text-xl font-semibold text-gray-800">
                            {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-[#00796B] text-center capitalize">{user.role}</p>
                    </div>

                    {/* Two-Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Personal Info */}
                        <div className="space-y-6">
                            <div className="bg-[#E0F2F1] p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-[#00796B] flex items-center mb-4">
                                    <FiUser className="mr-2" /> Personal Information
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={user.first_name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={user.last_name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={user.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone_number"
                                            value={user.phone_number}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Additional Info */}
                        <div className="space-y-6">
                            <div className="bg-[#E0F2F1] p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-[#00796B] flex items-center mb-4">
                                    <FiMapPin className="mr-2" /> Location
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Wilaya</label>
                                    <input
                                        type="text"
                                        name="wilaya"
                                        value={user.wilaya}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B]"
                                    />
                                </div>
                            </div>

                            {/* Security Section */}
                            <div className="bg-[#E0F2F1] p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-[#00796B] flex items-center mb-4">
                                    <FiShield className="mr-2" /> Security
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Change Password</label>
                                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={user.password}
                                            onChange={handleChange}
                                            placeholder="Enter new password"
                                            className="flex-1 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#00796B]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="px-3 text-gray-500 hover:text-[#00796B]"
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Leave blank to keep current password
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Password Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <FiShield className="mr-2 text-[#00796B]" /> Confirm Changes
                                </h3>
                                <button 
                                    onClick={() => setShowConfirmation(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <FiX />
                                </button>
                            </div>
                            
                            <p className="text-gray-600 mb-6">
                                For security reasons, please enter your current password to confirm these changes.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                        <FiKey className="mr-2 text-gray-500" /> Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B]"
                                            placeholder="Enter your password"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-gray-500 hover:text-[#00796B]"
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                    {passwordError && (
                                        <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmation(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={verifyPassword}
                                        className="px-4 py-2 bg-[#00796B] text-white rounded-md hover:bg-[#00695C] flex items-center transition-colors"
                                    >
                                        <FiSave className="mr-2" /> Confirm Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditProfilePage;