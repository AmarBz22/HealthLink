import { FiMapPin, FiPhone, FiMail, FiStar, FiSearch } from "react-icons/fi";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";


const StoreListingPage = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
  
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSpecialty, setFilterSpecialty] = useState("");
  
    // Fetch store data from API
    useEffect(() => {
        const fetchStores = async () => {
          try {
            const token = localStorage.getItem("authToken");
      
            const response = await axios.get("http://localhost:8000/api/stores", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
      
            console.log("Fetched stores data:", response);  // Log the entire response object
            console.log("Fetched stores:", response.data.data);  // Log the stores data
      
            setStores(response.data.data || []);  // Update to use response.data.data
          } catch (err) {
            console.error("Failed to fetch stores", err);
            setError("Failed to load store data. Please try again later.");
          } finally {
            setLoading(false);
          }
        };
      
        fetchStores();
      }, []);
      
      
// Only extract specialties from stores that have specialties as an array
const allSpecialties = Array.from(
    new Set(
      stores.flatMap(store =>
        Array.isArray(store.specialties) ? store.specialties : []
      )
    )
  );   
  const filteredStores = stores.filter(store => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.description.toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesSpecialty = filterSpecialty
      ? store.specialties.includes(filterSpecialty)
      : true;
  
    return matchesSearch && matchesSpecialty;
  });
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Medical Stores Directory</h1>
            <p className="text-gray-600 mt-2">
              Browse {stores.length} medical equipment suppliers
              {stores.filter(s => s.isMyStore).length > 0 ? ` including your ${stores.filter(s => s.isMyStore).length} store(s)` : ""}
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
                className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${store.isMyStore ? 'border-blue-500' : 'border-transparent'} hover:shadow-lg transition-shadow`}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-start">
                  <div className="flex items-center">
                    {store.logo && (
                      <img src={store.logo} alt={`${store.name} logo`} className="w-12 h-12 object-contain mr-3" />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{store.name}</h3>
                      {store.isMyStore && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          <FiStar className="mr-1" /> Your Store
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <p className="text-gray-600 mb-4">{store.description}</p>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Specialties</h4>
                    <div className="flex flex-wrap gap-1">
                      {store.specialties.map(specialty => (
                        <span key={specialty} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>


                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <FiPhone className="mr-2 text-gray-400" />
                      <span>{store.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiMail className="mr-2 text-gray-400" />
                      <span>{store.email}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <FiMapPin className="mr-2 mt-1 text-gray-400" />
                      <span>{store.address}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                  <button className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    View Details
                  </button>
                  {store.isMyStore && (
                    <button className="px-3 py-1 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700">
                      Manage
                    </button>
                  )}
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
