import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingBag,
  FiSearch,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiTag,
  FiTrash2
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import DeleteStoreModal from "../components/DeleteStoreModal";

const AdminStoreList = () => {
  const navigate = useNavigate();
  
  // State management
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [ownerNames, setOwnerNames] = useState({}); // New state for owner names
  const [loadingOwnerNames, setLoadingOwnerNames] = useState({}); // Loading state for individual owners
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    storeId: null,
    storeName: '',
    isDeleting: false
  });

  // Fetch current user data and check if admin
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          toast.error('Please login to view stores');
          navigate('/login');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };

        const userResponse = await axios.get('http://localhost:8000/api/user', { headers });
        const userData = userResponse.data;
        setCurrentUser(userData);

        if (userData.role !== 'Admin') {
          toast.error('Access denied. Admin privileges required.');
          navigate('/stores');
          return;
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
        toast.error('Failed to load user information');
      } finally {
        setUserLoading(false);
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  // Function to fetch owner name for a specific owner_id
  const fetchOwnerName = async (ownerId, token) => {
    // If owner name is already loaded or loading, skip
    if (ownerNames[ownerId] || loadingOwnerNames[ownerId]) {
      return;
    }

    // Set loading state for this owner
    setLoadingOwnerNames(prev => ({ ...prev, [ownerId]: true }));

    try {
      let response;
      let apiUrl = `http://localhost:8000/api/user/${ownerId}`;
      
      try {
        response = await axios.get(apiUrl, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      } catch (firstError) {
        // Try alternative endpoint
        apiUrl = `http://localhost:8000/api/users/${ownerId}`;
        response = await axios.get(apiUrl, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      }
      
      const ownerDisplayName = response.data.name || 
                              response.data.username || 
                              response.data.first_name || 
                              response.data.email || 
                              "Store Owner";
      
      setOwnerNames(prev => ({ ...prev, [ownerId]: ownerDisplayName }));
    } catch (error) {
      // Handle different types of errors gracefully
      let fallbackName = "Store Owner";
      if (error.response?.status === 401) {
        fallbackName = "Unauthorized";
      } else if (error.response?.status === 404) {
        fallbackName = "User Not Found";
      } else if (error.response?.status === 403) {
        fallbackName = "Access Denied";
      }
      
      setOwnerNames(prev => ({ ...prev, [ownerId]: fallbackName }));
    } finally {
      setLoadingOwnerNames(prev => ({ ...prev, [ownerId]: false }));
    }
  };

  // Fetch all stores with owner information
  useEffect(() => {
    const fetchStores = async () => {
      if (!currentUser || currentUser.role !== 'Admin') return;

      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          toast.error('Authentication required');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };

        const response = await axios.get('http://localhost:8000/api/stores', { headers });
        
        // Transform the backend data to match frontend expectations
        const storesData = (response.data || []).map(store => ({
          id: store.id,
          owner_id: store.owner_id,
          name: store.store_name,
          phone: store.phone,
          email: store.email,
          address: store.address,
          logo_path: store.logo,
          is_verified: store.is_verified,
          created_at: store.created_at,
          updated_at: store.updated_at,
          owner: store.owner || null // Assuming backend provides owner info
        }));

        setStores(storesData);

        // Fetch owner names for all unique owner IDs
        const uniqueOwnerIds = [...new Set(storesData.map(store => store.owner_id))];
        uniqueOwnerIds.forEach(ownerId => {
          if (ownerId) {
            fetchOwnerName(ownerId, token);
          }
        });

      } catch (error) {
        console.error('Error fetching stores:', error);
        toast.error('Failed to load stores');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [currentUser]);

  // Delete store function
  const handleDeleteStore = async (storeId) => {
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };

      await axios.delete(`http://localhost:8000/api/admin/store/${storeId}`, { headers });
      
      // Remove the deleted store from the local state
      setStores(prevStores => prevStores.filter(store => store.id !== storeId));
      
      toast.success('Store deleted successfully');
      setDeleteModal({ show: false, storeId: null, storeName: '', isDeleting: false });
      
    } catch (error) {
      console.error('Error deleting store:', error);
      
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        toast.error('Store not found');
      } else {
        toast.error('Failed to delete store. Please try again.');
      }
      
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Open delete modal
  const openDeleteModal = (store) => {
    setDeleteModal({
      show: true,
      storeId: store.id,
      storeName: store.name,
      isDeleting: false
    });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({ show: false, storeId: null, storeName: '', isDeleting: false });
    }
  };

  // Filter stores based on search query and verification status
  const filteredStores = stores.filter(store => {
    const ownerName = ownerNames[store.owner_id] || '';
    const matchesSearch = 
      store.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.owner_id?.toString().includes(searchQuery.toLowerCase()) ||
      ownerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'verified' && store.is_verified) ||
      (filterStatus === 'unverified' && !store.is_verified);

    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get verification badge
  const getVerificationBadge = (isVerified) => {
    return isVerified 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  // Get verification icon
  const getVerificationIcon = (isVerified) => {
    return isVerified ? FiCheckCircle : FiXCircle;
  };

  if (userLoading || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 p-8 rounded-xl text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-red-800 text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-red-600 mb-6">Admin privileges required to view all stores.</p>
          <button
            onClick={() => navigate('/stores')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Go to Store Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiShoppingBag className="mr-2 text-[#00796B]" />
            All Medical Stores
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor all platform stores
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          {/* Verification Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent"
          >
            <option value="all">All Stores</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search stores or owners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Store Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            title: 'Total Stores', 
            value: stores.length, 
            icon: FiShoppingBag, 
            color: 'border-blue-500'
          },
          { 
            title: 'Verified', 
            value: stores.filter(s => s.is_verified).length, 
            icon: FiCheckCircle, 
            color: 'border-green-500'
          },
          { 
            title: 'Unverified', 
            value: stores.filter(s => !s.is_verified).length, 
            icon: FiXCircle, 
            color: 'border-red-500'
          },
          { 
            title: 'Store Owners', 
            value: new Set(stores.map(s => s.owner_id)).size, 
            icon: FiUsers, 
            color: 'border-purple-500'
          }
        ].map((stat, index) => (
          <div key={index} className={`bg-white rounded-xl shadow p-6 border-l-4 ${stat.color}`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-100 mr-4">
                <stat.icon className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stores Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        {filteredStores.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingBag className="text-gray-400 text-3xl" />
            </div>
            <h2 className="text-xl font-medium text-gray-700 mb-2">No Stores Found</h2>
            <p className="text-gray-500">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No medical stores are currently registered.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStores.map((store) => {
                  const VerificationIcon = getVerificationIcon(store.is_verified);
                  const ownerName = ownerNames[store.owner_id];
                  const isLoadingOwnerName = loadingOwnerNames[store.owner_id];
                  
                  return (
                    <tr key={store.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {store.logo_path ? (
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={store.logo_path} 
                                alt={store.name}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`h-10 w-10 rounded-full bg-[#00796B] flex items-center justify-center ${store.logo_path ? 'hidden' : ''}`}
                            >
                              <FiShoppingBag className="text-white text-lg" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {store.name}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center mt-1">
                              <FiMapPin className="mr-1" />
                              {store.address || 'No address provided'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <FiUser className="mr-2 text-gray-400" />
                            Owner ID: {store.owner_id}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {isLoadingOwnerName ? (
                              <div className="flex items-center">
                                <div className="animate-spin h-3 w-3 border border-gray-300 border-t-gray-600 rounded-full mr-2"></div>
                                Loading...
                              </div>
                            ) : (
                              ownerName || 'Unknown Name'
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {store.phone && (
                            <div className="flex items-center mb-1">
                              <FiPhone className="mr-2 text-gray-400" />
                              {store.phone}
                            </div>
                          )}
                          {store.email && (
                            <div className="flex items-center">
                              <FiMail className="mr-2 text-gray-400" />
                              <span className="truncate max-w-xs">{store.email}</span>
                            </div>
                          )}
                          {!store.phone && !store.email && (
                            <span className="text-gray-400 text-xs">No contact info</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVerificationBadge(store.is_verified)}`}>
                          <VerificationIcon className="mr-1" />
                          {store.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FiCalendar className="mr-2 text-gray-400" />
                          {formatDate(store.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openDeleteModal(store)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors"
                          title="Delete Store"
                        >
                          <FiTrash2 className="mr-1" size={14} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">
          Showing {filteredStores.length} of {stores.length} stores
        </p>
      </div>

      {/* Delete Modal */}
      {deleteModal.show && (
        <DeleteStoreModal
          storeId={deleteModal.storeId}
          storeName={deleteModal.storeName}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteStore}
          isDeleting={deleteModal.isDeleting}
        />
      )}
    </div>
  );
};

export default AdminStoreList;