import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiSave, FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiEdit, FiCamera } from "react-icons/fi";
import axios from "axios";

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
    profile_image: null,  // Changed from profilePic to profile_image to match API response
    password: "********"
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await axios.get('http://192.168.43.101:8000/api/user', {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
          },
        });
  
        console.log("Axios response:", response);
  
        if (response.data) {
          // Set user state with the data from API
          setUser({
            id: response.data.id,
            first_name: response.data.first_name,
            last_name: response.data.last_name,
            email: response.data.email,
            phone_number: response.data.phone_number,
            wilaya: response.data.wilaya,
            role: response.data.role,
            profile_image: response.data.profile_image || null,  // Changed to match API response
            password: "********",
          });
          
          console.log("Profile image from API:", response.data.profile_image);
        }
      } catch (error) {
        console.error("Error fetching user data with Axios:", error);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#00796B] px-6 py-4">
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
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-[#B2DFDB] object-cover"
                    onError={(e) => {
                      console.error("Image failed to load:", e.target.src);
                      // Fallback to default user icon
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `
                        <div class="w-32 h-32 rounded-full border-4 border-[#B2DFDB] bg-gray-200 flex items-center justify-center">
                          <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="text-4xl text-gray-400" height="3em" width="3em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-[#B2DFDB] bg-gray-200 flex items-center justify-center">
                    <FiUser className="text-4xl text-gray-400" />
                  </div>
                )}
                <button 
                  onClick={handleEditClick}
                  className="absolute -bottom-2 right-0 bg-[#00796B] text-white p-2 rounded-full hover:bg-[#00695C] transition-all shadow-md"
                >
                  <FiCamera className="text-lg" />
                </button>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-gray-800">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-[#00796B] font-medium capitalize">{user.role}</p>
            </div>

            <div className="flex-1 flex justify-end">
              <button
                onClick={handleEditClick}
                className="px-4 py-2 bg-[#00796B] text-white rounded-md hover:bg-[#00695C] flex items-center transition-colors shadow-md"
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
                <h3 className="text-lg font-semibold text-[#00796B] border-b pb-2 flex items-center">
                  <FiUser className="mr-2" /> Personal Information
                </h3>
                <ProfileField label="First Name" value={user.first_name} />
                <ProfileField label="Last Name" value={user.last_name} />
                <ProfileField label="Email" value={user.email} icon={<FiMail />} />
                <ProfileField label="Phone" value={user.phone_number} icon={<FiPhone />} />
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#00796B] border-b pb-2 flex items-center">
                  <FiMapPin className="mr-2" /> Location
                </h3>
                <ProfileField label="Wilaya" value={user.wilaya} />
                <ProfileField label="Role" value={user.role} icon={<FiBriefcase />} />
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