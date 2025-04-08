import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSave, FiX, FiUpload, FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiMapPin, FiShield, FiKey } from "react-icons/fi";

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
        password: ""
    });

    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // Get auth token from localStorage
    const getAuthToken = () => {
        return localStorage.getItem('authToken');
    };

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const authToken = getAuthToken();
                if (!authToken) {
                    throw new Error('No authentication token found');
                }

                const response = await fetch('http://localhost:8000/api/user', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.success) {
                    setUser({
                        ...data.user,
                        password: ""
                    });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                if (error.message.includes('401')) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

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

        const response = await fetch('http://localhost:8000/api/user', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone_number: user.phone_number,
                wilaya: user.wilaya,
                password: user.password || undefined, // Only send if changed
                current_password: confirmPassword
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update profile");
        }

        const data = await response.json();
        
        if (data.success) {
            navigate('/profile');
        }
    } catch (error) {
        console.error("Update failed:", error);
        setPasswordError(error.message || "Invalid password. Please try again.");
    }
};

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-4 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between mb-6">
                <button 
                    onClick={() => navigate('/profile')}
                    className="flex items-center text-blue-500 hover:text-blue-700"
                >
                    <FiX className="mr-1" /> Cancel
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
                <button
                    type="submit"
                    form="profileForm"
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    <FiSave className="mr-2" /> Save
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <form id="profileForm" onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Profile Picture Section - Removed since we're not handling images */}
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-4 border-blue-100 bg-gray-200 flex items-center justify-center">
                            <FiUser className="text-4xl text-gray-400" />
                        </div>
                        <h3 className="mt-3 text-xl font-semibold text-gray-800">
                            {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-blue-500 text-center capitalize">{user.role}</p>
                    </div>

                    {/* Two-Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Personal Info */}
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-blue-700 flex items-center mb-4">
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Additional Info */}
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-blue-700 flex items-center mb-4">
                                    <FiMapPin className="mr-2" /> Location
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Wilaya</label>
                                    <input
                                        type="text"
                                        name="wilaya"
                                        value={user.wilaya}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Security Section */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-blue-700 flex items-center mb-4">
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
                                            className="flex-1 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="px-3 text-gray-500 hover:text-blue-500"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <FiShield className="mr-2 text-blue-500" /> Confirm Changes
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter your password"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-gray-500 hover:text-blue-500"
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
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
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