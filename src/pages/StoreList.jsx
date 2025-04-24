import { FiMapPin, FiPhone, FiMail, FiStar, FiSearch, FiCheckCircle, FiTrash2 } from "react-icons/fi";
import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Spinner = ({ size = 'small', className = '' }) => (
  <div className={`${size === 'small' ? 'h-4 w-4' : 'h-6 w-6'} animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />
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
  const [filterSpecialty, setFilterSpecialty] = useState("");

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
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:8000/api/stores", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStores(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch stores", err);
      setError("Failed to load store data. Please try again later.");
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
      await axios.delete(`http://localhost:8000/api/stores/${storeId}`, {
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

  const allSpecialties = Array.from(
    new Set(
      stores.flatMap(store =>
        Array.isArray(store.specialties) ? store.specialties : []
      )
    )
  );

  const filteredStores = stores.filter(store => {
    const matchesSearch =
      store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.description?.toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesSpecialty = filterSpecialty
      ? store.specialties?.includes(filterSpecialty)
      : true;
  
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <FiCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-green-800 font-medium">Success!</h3>
              <p className="text-green-700 text-sm">
                Your medical store has been created successfully.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Medical Stores Directory</h1>
            <p className="text-gray-600 mt-2">
              Browse {stores.length} medical equipment suppliers
              {stores.filter(s => s.is_mine).length > 0 && 
                ` (including your ${stores.filter(s => s.is_mine).length} store${stores.filter(s => s.is_mine).length > 1 ? 's' : ''})`}
            </p>
          </div>

          {/* Search */}
          <div className="relative mt-4 md:mt-0 w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search stores..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#00796B] focus:border-[#00796B] sm:text-sm rounded-md"
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
            >
              <option value="">All Specialties</option>
              {allSpecialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm("");
              setFilterSpecialty("");
            }}
            className="self-end px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Result Count */}
        <div className="mb-4 text-gray-600">
          Showing {filteredStores.length} of {stores.length} stores
        </div>

        {/* Store Cards */}
        {filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map(store => (
              <div
                key={store.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${store.is_mine ? 'border-[#00796B]' : 'border-transparent'} hover:shadow-lg transition-shadow relative`}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    {store.logo_path && (
                      <img 
                        src={`http://localhost:8000/storage/${store.logo_path}`} 
                        alt={`${store.name} logo`} 
                        className="w-12 h-12 object-cover rounded-full mr-3 border border-gray-200"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{store.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {store.is_mine && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#00796B] text-white">
                            <FiStar className="mr-1" /> Your Store
                          </span>
                        )}
                        {store.is_verified && (
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

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Specialties</h4>
                    <div className="flex flex-wrap gap-1">
                      {store.specialties?.map(specialty => (
                        <span key={specialty} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#E0F2F1] text-[#00796B]">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <FiPhone className="mr-2 text-[#00796B]" />
                      <span>{store.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiMail className="mr-2 text-[#00796B]" />
                      <span>{store.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <FiMapPin className="mr-2 mt-1 text-[#00796B]" />
                      <span className="line-clamp-2">{store.address || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  {store.is_mine && (
                    <button 
                      onClick={() => handleDeleteStore(store.id)}
                      disabled={deletingStoreId === store.id}
                      className={`px-3 py-1 bg-red-50 border border-red-200 rounded-md text-sm font-medium text-red-700 hover:bg-red-100 flex items-center ${
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
                    className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreListingPage;