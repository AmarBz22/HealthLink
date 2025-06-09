import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPackage,
  FiSearch,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiTag,
  FiCheckCircle,
  FiXCircle,
  FiShoppingBag,
  FiBarChart,
  FiTrendingUp,
  FiEye
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminInventoryProducts = () => {
  const navigate = useNavigate();
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [ownerNames, setOwnerNames] = useState({});
  const [loadingOwnerNames, setLoadingOwnerNames] = useState({});
  const [storeNames, setStoreNames] = useState({});
  const [loadingStoreNames, setLoadingStoreNames] = useState({});

  const storageUrl = 'http://localhost:8000/storage';
  
  // Categories for filtering
  const categories = ['Medications', 'Electronics', 'Clothing', 'Food', 'Beauty', 'Other'];

  // Fetch current user data and check if admin
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          toast.error('Please login to view inventory');
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
          navigate('/inventory/products');
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

  // Function to fetch owner name for a specific user_id
  const fetchOwnerName = async (userId, token) => {
    if (ownerNames[userId] || loadingOwnerNames[userId]) {
      return;
    }

    setLoadingOwnerNames(prev => ({ ...prev, [userId]: true }));

    try {
      let response;
      let apiUrl = `http://localhost:8000/api/user/${userId}`;
      
      try {
        response = await axios.get(apiUrl, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      } catch (firstError) {
        apiUrl = `http://localhost:8000/api/users/${userId}`;
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
                              "Unknown User";
      
      setOwnerNames(prev => ({ ...prev, [userId]: ownerDisplayName }));
    } catch (error) {
      let fallbackName = "Unknown User";
      if (error.response?.status === 401) {
        fallbackName = "Unauthorized";
      } else if (error.response?.status === 404) {
        fallbackName = "User Not Found";
      } else if (error.response?.status === 403) {
        fallbackName = "Access Denied";
      }
      
      setOwnerNames(prev => ({ ...prev, [userId]: fallbackName }));
    } finally {
      setLoadingOwnerNames(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Function to fetch store name for a specific store_id
  const fetchStoreName = async (storeId, token) => {
    if (storeNames[storeId] || loadingStoreNames[storeId]) {
      return;
    }

    setLoadingStoreNames(prev => ({ ...prev, [storeId]: true }));

    try {
      const response = await axios.get(`http://localhost:8000/api/stores/${storeId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const storeName = response.data.store_name || response.data.name || "Unknown Store";
      setStoreNames(prev => ({ ...prev, [storeId]: storeName }));
    } catch (error) {
      let fallbackName = "Unknown Store";
      if (error.response?.status === 404) {
        fallbackName = "Store Not Found";
      }
      
      setStoreNames(prev => ({ ...prev, [storeId]: fallbackName }));
    } finally {
      setLoadingStoreNames(prev => ({ ...prev, [storeId]: false }));
    }
  };

  // Fetch all inventory products
  useEffect(() => {
    const fetchInventoryProducts = async () => {
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

        const response = await axios.get('http://localhost:8000/api/products', { headers });
        
        // Filter only inventory products
        const inventoryProducts = (response.data || [])
          .filter(product => product.type === "inventory")
          .map(product => ({
            ...product,
            id: product.product_id || product.id,
            name: product.product_name,
            price: product.inventory_price || product.price,
            quantity: product.inventory_quantity || product.quantity,
            image: product.product_image
          }));

        setProducts(inventoryProducts);

        // Fetch owner names for all unique user IDs
        const uniqueUserIds = [...new Set(inventoryProducts.map(product => product.user_id))];
        uniqueUserIds.forEach(userId => {
          if (userId) {
            fetchOwnerName(userId, token);
          }
        });

        // Fetch store names for all unique store IDs
        const uniqueStoreIds = [...new Set(inventoryProducts.map(product => product.store_id).filter(Boolean))];
        uniqueStoreIds.forEach(storeId => {
          fetchStoreName(storeId, token);
        });

      } catch (error) {
        console.error('Error fetching inventory products:', error);
        toast.error('Failed to load inventory products');
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryProducts();
  }, [currentUser]);

  // Filter products based on search query and category
  const filteredProducts = products.filter(product => {
    const ownerName = ownerNames[product.user_id] || '';
    const storeName = storeNames[product.store_id] || '';
    
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.user_id?.toString().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'all' || 
      product.category === filterCategory;

    return matchesSearch && matchesCategory;
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

  // Format price
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Calculate total inventory value
  const totalInventoryValue = products.reduce((total, product) => {
    const price = parseFloat(product.price || 0);
    const quantity = parseInt(product.quantity || 0);
    return total + (price * quantity);
  }, 0);

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
          <p className="text-red-600 mb-6">Admin privileges required to view all inventory products.</p>
          <button
            onClick={() => navigate('/inventory/products')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Go to Inventory Products
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
            <FiPackage className="mr-2 text-[#00796B]" />
            All Inventory Products
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor all platform inventory products
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            title: 'Total Products', 
            value: products.length, 
            icon: FiPackage, 
            color: 'border-blue-500'
          },
          { 
            title: 'Total Value', 
            value: `$${totalInventoryValue.toFixed(2)}`, 
            icon: FiDollarSign, 
            color: 'border-green-500'
          },
          { 
            title: 'Categories', 
            value: new Set(products.map(p => p.category).filter(Boolean)).size, 
            icon: FiTag, 
            color: 'border-purple-500'
          },
          { 
            title: 'Sellers', 
            value: new Set(products.map(p => p.user_id)).size, 
            icon: FiUser, 
            color: 'border-orange-500'
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

      {/* Products Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="text-gray-400 text-3xl" />
            </div>
            <h2 className="text-xl font-medium text-gray-700 mb-2">No Products Found</h2>
            <p className="text-gray-500">
              {searchQuery || filterCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No inventory products are currently available.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pricing & Stock
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
                {filteredProducts.map((product) => {
                  const ownerName = ownerNames[product.user_id];
                  const isLoadingOwnerName = loadingOwnerNames[product.user_id];
                  const storeName = storeNames[product.store_id];
                  const isLoadingStoreName = loadingStoreNames[product.store_id];
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {product.image ? (
                              <img 
                                className="h-12 w-12 rounded-lg object-cover" 
                                src={`${storageUrl}/${product.image}`}
                                alt={product.name}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`h-12 w-12 rounded-lg bg-[#00796B] flex items-center justify-center ${product.image ? 'hidden' : ''}`}
                            >
                              <FiPackage className="text-white text-lg" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <FiTag className="mr-1" />
                              {product.category || 'Uncategorized'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <FiUser className="mr-2 text-gray-400" />
                            User ID: {product.user_id}
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
                          {product.store_id ? (
                            <>
                              <div className="flex items-center">
                                <FiShoppingBag className="mr-2 text-gray-400" />
                                Store ID: {product.store_id}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {isLoadingStoreName ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin h-3 w-3 border border-gray-300 border-t-gray-600 rounded-full mr-2"></div>
                                    Loading...
                                  </div>
                                ) : (
                                  storeName || 'Unknown Store'
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs">No store assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <FiDollarSign className="mr-1 text-gray-400" />
                            {formatPrice(product.price)}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <FiBarChart className="mr-1" />
                            Qty: {product.stock || 0}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FiCalendar className="mr-2 text-gray-400" />
                          {formatDate(product.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="text-[#00796B] hover:text-[#00695C] mr-3"
                          title="View Product"
                        >
                          <FiEye className="w-4 h-4" />
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
          Showing {filteredProducts.length} of {products.length} inventory products
        </p>
      </div>
    </div>
  );
};

export default AdminInventoryProducts;