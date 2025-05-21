import { FiMapPin, FiPhone, FiMail, FiStar, FiSearch, FiCheckCircle, FiTrash2, FiPlus } from "react-icons/fi";
import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getUserIdFromToken } from '../utils/auth';

const Spinner = ({ size = 'small', className = '' }) => (
  <div className={`${size === 'small' ? 'h-4 w-4' : 'h-6 w-6'} animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />
);

const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-transparent animate-pulse">
    {/* Header */}
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>

    {/* Body */}
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6 mb-4"></div>

      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="flex flex-wrap gap-1">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="flex items-start">
          <div className="w-4 h-4 bg-gray-200 rounded-full mr-2 mt-1"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end items-center">
      <div className="h-8 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

const StoreListingPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [deletingStoreId, setDeletingStoreId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    if (location.state?.success) {
      setShowSuccess(true);
      window.history.replaceState({}, document.title);
      
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        navigate('/login');
        return;
      }
  
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };
  
      // First get current user data
      const userResponse = await axios.get('http://localhost:8000/api/user', { headers });
      const currentUser = userResponse.data;
      const userId = currentUser.id;
      setCurrentUserId(userId);
      setCurrentUserRole(currentUser.role);
  
      // Then fetch stores
      const response = await axios.get("http://localhost:8000/api/stores", { headers });
      // Transform the backend data to match frontend expectations
      const storesData = (response.data || []).map(store => ({
        id: store.id,
        owner_id: store.owner_id,
        name: store.store_name,  // Backend uses store_name, frontend expects name
        description: store.description,
        phone: store.phone,
        email: store.email,
        address: store.address,
        logo_path: store.logo,
        is_verified: store.is_verified,
        specialties: store.specialties || [],
        isOwner: store.owner_id === userId
      }));
  
      setStores(storesData);
  
    } catch (err) {
      console.error("Failed to fetch stores", err);
      setError("Failed to load store data. Please try again later.");
      if (err.response?.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleDeleteStore = async (storeId) => {
    setDeletingStoreId(storeId);
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:8000/api/store/${storeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStores(prevStores => prevStores.filter(store => store.id !== storeId));
      toast.success("Store deleted successfully");
    } catch (error) {
      console.error("Failed to delete store", error);
      toast.error(error.response?.data?.message || "Failed to delete store");
    } finally {
      setDeletingStoreId(null);
    }
  };

  const filteredStores = stores.filter(store => {
    return store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           store.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Check if user can create a store (not a doctor)
  const canCreateStore = currentUserRole && currentUserRole !== 'Doctor' && currentUserRole !== 'Dentist';

  // Create skeleton array for loading state
  const skeletonArray = Array(6).fill(0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start shadow-sm animate-fadeIn">
            <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-green-800 font-medium">Success!</h3>
              <p className="text-green-700 text-sm">
                Your medical store has been created successfully.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start shadow-sm">
            <div className="text-red-500 mt-1 mr-3 flex-shrink-0">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-[#004D40] to-[#00796B] text-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Medical Stores Directory</h1>
              <p className="mt-2 opacity-90">
                {!loading && (
                  <>
                    Browse {stores.length} medical equipment suppliers
                    {stores.filter(s => s.isOwner).length > 0 && 
                      ` (including your ${stores.filter(s => s.isOwner).length} store${stores.filter(s => s.isOwner).length > 1 ? 's' : ''})`}
                  </>
                )}
              </p>
            </div>
            
            {/* Add Store button - only shown for non-doctor users */}
            {canCreateStore && (
              <button
                onClick={() => navigate('/store/add')}
                className="bg-white text-[#00796B] hover:bg-[#E0F2F1] px-4 py-2 rounded-md flex items-center transition-colors shadow-sm font-medium"
              >
                <FiPlus className="mr-2" />
                Add Store
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search stores..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Result Count */}
        {!loading && (
          <div className="mb-4 text-gray-600 font-medium">
            Showing {filteredStores.length} of {stores.length} stores
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skeletonArray.map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map(store => (
              <div
                key={store.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
                  store.isOwner ? 'border-[#00796B]' : 'border-transparent'
                } hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative`}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    {store.logo_path ? (
                      <img 
                        src={`http://localhost:8000/storage/${store.logo_path}`} 
                        alt={`${store.name} logo`} 
                        className="w-12 h-12 object-cover rounded-full mr-3 border border-gray-200"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=00796B&color=fff`;
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full mr-3 bg-[#00796B] text-white flex items-center justify-center font-bold">
                        {store.name?.charAt(0).toUpperCase() || "M"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{store.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {store.isOwner && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#00796B] text-white">
                            <FiStar className="mr-1" /> Your Store
                          </span>
                        )}
                        {store.is_verified === 1 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#B2DFDB] text-[#00796B]">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <p className="text-gray-600 mb-4 line-clamp-3">{store.description}</p>

                  {/* Specialties */}
                  {Array.isArray(store.specialties) && store.specialties.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Specialties</h4>
                      <div className="flex flex-wrap gap-1">
                        {store.specialties.map(specialty => (
                          <span key={specialty} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#E0F2F1] text-[#00796B]">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <FiPhone className="mr-2 text-[#00796B]" />
                      <span>{store.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiMail className="mr-2 text-[#00796B]" />
                      <span className="truncate">{store.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <FiMapPin className="mr-2 mt-1 text-[#00796B]" />
                      <span className="line-clamp-2">{store.address || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  {store.isOwner && (
                    <button 
                      onClick={() => handleDeleteStore(store.id)}
                      disabled={deletingStoreId === store.id}
                      className={`px-3 py-1.5 bg-red-50 border border-red-200 rounded-md text-sm font-medium text-red-700 hover:bg-red-100 flex items-center ${
                        deletingStoreId === store.id ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {deletingStoreId === store.id ? (
                        <>
                          <Spinner size="small" className="mr-1" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <FiTrash2 className="mr-1" />
                          Delete
                        </>
                      )}
                    </button>
                  )}
                  <button 
                    onClick={() => navigate(`/store/${store.id}`)}
                    className="px-3 py-1.5 bg-[#E0F2F1] text-[#00796B] border border-[#B2DFDB] rounded-md text-sm font-medium hover:bg-[#B2DFDB] transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-4 py-2 bg-[#00796B] text-white rounded-md hover:bg-[#004D40] transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreListingPage;