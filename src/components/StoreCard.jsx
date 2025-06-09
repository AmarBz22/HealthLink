import { FiMapPin, FiPhone, FiUser, FiStar, FiTrash2, FiEdit2, FiExternalLink } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeleteStoreModal from "./DeleteStoreModal";
import axios from "axios";

const StoreCard = ({ 
  store, 
  showDelete = true,
  currentUserId = null,
  onDeleteSuccess = () => {}
}) => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [loadingOwnerName, setLoadingOwnerName] = useState(true);
  
  const isOwner = currentUserId ? store.owner_id === currentUserId : store.isOwner;
  
  // Get the store name - handle both store_name and name properties
  const storeName = store.store_name || store.name || 'Unnamed Store';

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem("authToken");
    return !!token;
  };

  useEffect(() => {
    const fetchOwnerName = async () => {
      // If store already has owner name, use it
      if (store.owner_name) {
        setOwnerName(store.owner_name);
        setLoadingOwnerName(false);
        return;
      }

      // If it's the current user's store, show "You"
      if (isOwner) {
        setOwnerName("You");
        setLoadingOwnerName(false);
        return;
      }

      // If user is not authenticated, don't try to fetch owner name - just use default
      if (!isAuthenticated()) {
        setOwnerName("Store Owner");
        setLoadingOwnerName(false);
        return;
      }

      // Only fetch owner name if user is authenticated
      try {
        setLoadingOwnerName(true);
        const token = localStorage.getItem("authToken");
        
        // Try different possible API endpoints
        let response;
        let apiUrl = `http://localhost:8000/api/user/${store.owner_id}`;
        
        try {
          response = await axios.get(apiUrl, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
        } catch (firstError) {
          // Try alternative endpoint
          apiUrl = `http://localhost:8000/api/users/${store.owner_id}`;
          response = await axios.get(apiUrl, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
        }
        
        const ownerDisplayName = response.data.name || response.data.username || response.data.first_name || response.data.email || "Store Owner";
        setOwnerName(ownerDisplayName);
      } catch (error) {
        // Handle different types of errors gracefully
        if (error.response?.status === 401) {
          // Authentication failed - token may be invalid or expired
          localStorage.removeItem('authToken');
          setOwnerName("Store Owner");
        } else if (error.response?.status === 404) {
          setOwnerName("Store Owner");
        } else if (error.response?.status === 403) {
          setOwnerName("Store Owner");
        } else {
          setOwnerName("Store Owner");
        }
      } finally {
        setLoadingOwnerName(false);
      }
    };

    if (store && store.owner_id) {
      fetchOwnerName();
    } else {
      setOwnerName("Store Owner");
      setLoadingOwnerName(false);
    }
  }, [store.owner_id, store.owner_name, isOwner, store]);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:8000/api/store/${store.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onDeleteSuccess(store.id);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div
        className={`bg-white rounded-xl shadow-lg overflow-hidden border ${
          isOwner ? 'border-[#00796B]' : 'border-gray-200'
        } hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group`}
      >
        {/* Verified Ribbon */}
        {store.is_verified === 1 && (
          <div className="absolute top-0 right-0 bg-[#00796B] text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
            Verified
          </div>
        )}

        {/* Header with gradient */}
        <div className={`p-4 ${isOwner ? 'bg-gradient-to-r from-[#00796B] to-[#004D40]' : 'bg-gray-50'} text-${isOwner ? 'white' : 'gray-800'}`}>
          <div className="flex items-center">
            {store.logo_path ? (
              <img 
                src={`http://localhost:8000/storage/${store.logo_path}`} 
                alt={`${storeName} logo`} 
                className="w-14 h-14 object-cover rounded-full mr-3 border-2 border-white shadow-sm"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName)}&background=00796B&color=fff`;
                }}
              />
            ) : (
              <div className="w-14 h-14 rounded-full mr-3 bg-[#00796B] text-white flex items-center justify-center font-bold border-2 border-white shadow-sm">
                {storeName?.charAt(0).toUpperCase() || "M"}
              </div>
            )}
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${isOwner ? 'text-white' : 'text-gray-900'}`}>
                {storeName}
                {isOwner && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-[#00796B]">
                    <FiStar className="mr-1" /> Your Store
                  </span>
                )}
              </h3>
              <div className="flex items-center mt-1">
                <FiMapPin className={`mr-1 ${isOwner ? 'text-white' : 'text-[#00796B]'}`} />
                <span className={`text-sm ${isOwner ? 'text-white' : 'text-gray-600'}`}>
                  {store.address ? `${store.address.split(',')[0]}` : 'Location not provided'}
                </span>
              </div>
              {/* Owner name in header - only show if authenticated or if it's the owner */}
              {(isAuthenticated() || isOwner) && (
                <div className="flex items-center mt-1">
                  <FiUser className={`mr-1 text-xs ${isOwner ? 'text-white' : 'text-[#00796B]'}`} />
                  <span className={`text-xs ${isOwner ? 'text-white' : 'text-gray-600'}`}>
                    {loadingOwnerName ? 'Loading...' : `Owner: ${ownerName}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Specialties */}
          {Array.isArray(store.specialties) && store.specialties.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {store.specialties.map(specialty => (
                  <span 
                    key={specialty} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E0F2F1] text-[#00796B]"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <div className="p-2 bg-[#E0F2F1] rounded-full mr-3">
                <FiPhone className="text-[#00796B]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">{store.phone || 'Not provided'}</p>
              </div>
            </div>
            
            {/* Only show owner info if authenticated or if it's the owner */}
            {(isAuthenticated() || isOwner) && (
              <div className="flex items-center text-gray-700">
                <div className="p-2 bg-[#E0F2F1] rounded-full mr-3">
                  <FiUser className="text-[#00796B]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Store Owner</p>
                  <p className="font-medium">
                    {loadingOwnerName ? (
                      <span className="animate-pulse bg-gray-200 h-4 w-20 rounded"></span>
                    ) : (
                      ownerName
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          {showDelete && isOwner && (
            <div className="flex space-x-2">
              <button 
                onClick={() => navigate(`/store/${store.id}/editStore`)}
                className="p-2 bg-white text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                title="Edit Store"
              >
                <FiEdit2 />
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="p-2 bg-white text-red-600 rounded-lg border border-gray-200 hover:bg-red-50 transition-colors"
                title="Delete Store"
              >
                <FiTrash2 />
              </button>
            </div>
          )}
          <button 
            onClick={() => navigate(`/store/${store.id}`)}
            className="flex items-center px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors text-sm font-medium"
          >
            View Details <FiExternalLink className="ml-2" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteStoreModal
          storeId={store.id}
          storeName={storeName}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleting}
        />
      )}
    </>
  );
};

export default StoreCard;