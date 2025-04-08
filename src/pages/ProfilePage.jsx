import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiSave, FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiEdit, FiCamera } from "react-icons/fi";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    id: null,
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    wilaya: "",
    role: "",
    profilePic: null,
    password: "********"
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:8000/api/user', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        if (data.success) {
          setUser(prev => ({
            ...prev,
            ...data.user,
            password: "********"
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditClick = () => {
    navigate('/profile/edit');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">
            User Profile
          </h2>
        </div>

        {/* Profile Content */}
        <div className="p-6 md:p-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
            <div className="flex flex-col items-center">
              <div className="relative group">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-blue-100 object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-blue-100 bg-gray-200 flex items-center justify-center">
                    <FiUser className="text-4xl text-gray-400" />
                  </div>
                )}
                <button 
                  onClick={handleEditClick}
                  className="absolute -bottom-2 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-all"
                >
                  <FiEdit className="text-lg" />
                </button>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-gray-800">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-blue-500 font-medium capitalize">{user.role}</p>
            </div>

            <div className="flex-1 flex justify-end">
              <button
                onClick={handleEditClick}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
              >
                <FiEdit className="mr-2" /> Edit Profile
              </button>
            </div>
          </div>

          {/* Profile Information Display */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-500 border-b pb-2 flex items-center">
                  <FiUser className="mr-2" /> Personal Information
                </h3>
                <ProfileField label="First Name" value={user.first_name} />
                <ProfileField label="Last Name" value={user.last_name} />
                <ProfileField label="Email" value={user.email} icon={<FiMail />} />
                <ProfileField label="Phone" value={user.phone_number} icon={<FiPhone />} />
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-500 border-b pb-2 flex items-center">
                  <FiMapPin className="mr-2" /> Location
                </h3>
                <ProfileField label="Wilaya" value={user.wilaya} />
                <ProfileField label="Role" value={user.role} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Profile Field Component
const ProfileField = ({ label, value, icon }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <div className="flex items-center mt-1 p-2 bg-gray-50 rounded-md">
      {icon && <span className="mr-2 text-gray-400">{icon}</span>}
      <p className="text-gray-800">{value || '-'}</p>
    </div>
  </div>
);

export default ProfilePage;