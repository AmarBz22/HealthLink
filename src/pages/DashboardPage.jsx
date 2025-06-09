import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiHome, 
  FiUsers, 
  FiPackage, 
  FiShoppingBag, 
  FiBarChart2, 
  FiPieChart,
  FiTrendingUp,
  FiGrid,
  FiSearch
} from 'react-icons/fi';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    users: [],
    stores: [],
    products: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  const getProductDisplayImage = (product, storageUrl = '') => {
    // Handle new image structure (array of images)
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Find primary image or use the first image
      const primaryImage = product.images.find(img => img.is_primary === 1 || img.is_primary === true);
      const selectedImage = primaryImage || product.images[0];
      
      // Return the image path (assuming it's already a full URL or relative path)
      return selectedImage.image_path;
    }
    
    // Legacy support for products with direct image property
    if (product.image) {
      return product.image.startsWith('http') ? product.image : `${storageUrl}/${product.image}`;
    }
    
    // No image available
    return null;
  };

  // Helper function to make API calls with better error handling
  const fetchWithErrorHandling = async (url, headers) => {
    try {
      console.log(`Fetching from URL: ${url}`);
      const response = await axios.get(url, { headers });
      console.log(`Response from ${url}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error.response || error);
      // Store the error for debugging
      const errorDetail = {
        url,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
      setError(prevErrors => ({ ...prevErrors, [url]: errorDetail }));
      // Still return empty data to prevent breaking the UI
      return [];
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          toast.error('Please login to view dashboard');
          console.log('No auth token found, redirecting to login');
          navigate('/login');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };

        console.log('Starting to fetch dashboard data with headers:', 
          { Authorization: 'Bearer [REDACTED]', Accept: headers.Accept });

        // Get authenticated user and role
        const userResponse = await fetchWithErrorHandling('http://localhost:8000/api/user', headers);
        
        if (!userResponse || Object.keys(userResponse).length === 0) {
          toast.error('Failed to authenticate user');
          console.error('User response is empty or invalid:', userResponse);
          setLoading(false);
          return;
        }
        
        setUser({
          ...userResponse,
          name: userResponse.first_name + ' ' + userResponse.last_name
        });
        console.log('User data retrieved:', { 
          name: userResponse.first_name + ' ' + userResponse.last_name, 
          role: userResponse.role,
          id: userResponse.id
        });

        // Check if user is admin or supplier, if not redirect
        const userRole = userResponse.role?.toLowerCase();
        if (userRole !== 'admin' && userRole !== 'supplier') {
          toast.error('You do not have permission to access this page');
          console.log('Unauthorized user trying to access dashboard, redirecting to home');
          navigate('/');
          return;
        }

        // Fetch data based on user role
        if (userRole === 'admin') {
          // Admin can see all data
          const [usersData, storesData, productsData] = await Promise.all([
            fetchWithErrorHandling('http://localhost:8000/api/admin/users', headers),
            fetchWithErrorHandling('http://localhost:8000/api/stores', headers),
            fetchWithErrorHandling('http://localhost:8000/api/products', headers)
          ]);
          
          console.log('Admin dashboard data fetched successfully:',
            { 
              usersCount: usersData?.length || 0, 
              storesCount: storesData?.length || 0, 
              productsCount: productsData?.length || 0 
            }
          );
          
          // Format and set admin data
          const formattedUsers = Array.isArray(usersData.users) ? usersData.users : 
                                (Array.isArray(usersData) ? usersData : []);
          
          setDashboardData({
            users: formattedUsers,
            stores: Array.isArray(storesData) ? storesData : [],
            products: Array.isArray(productsData) ? productsData : [],
          });
        } else if (userRole === 'supplier') {
          // Supplier can only see their own stores and products
          // Fetch all data first, then filter by owner_id
          const [allStoresData, allProductsData] = await Promise.all([
            fetchWithErrorHandling('http://localhost:8000/api/stores', headers),
            fetchWithErrorHandling('http://localhost:8000/api/products', headers)
          ]);
          
          // Filter stores by owner_id matching user id
          const supplierStores = Array.isArray(allStoresData) ? 
            allStoresData.filter(store => store.owner_id === userResponse.id) : [];
          
          // Filter products by owner_id matching user id (assuming products have owner_id)
          // If products don't have owner_id directly, you might need to filter by store_id
          const supplierProducts = Array.isArray(allProductsData) ? 
            allProductsData.filter(product => {
              // If product has owner_id, use it directly
              if (product.owner_id) {
                return product.owner_id === userResponse.id;
              }
              // If product has store_id, check if it belongs to supplier's stores
              if (product.store_id) {
                return supplierStores.some(store => store.id === product.store_id);
              }
              return false;
            }) : [];
          
          console.log('Supplier dashboard data processed:',
            { 
              totalStores: allStoresData?.length || 0,
              supplierStores: supplierStores.length,
              totalProducts: allProductsData?.length || 0,
              supplierProducts: supplierProducts.length,
              userId: userResponse.id
            }
          );
          
          setDashboardData({
            users: [], // Suppliers don't see users
            stores: supplierStores,
            products: supplierProducts,
          });
        }
      } catch (error) {
        console.error('Error in main dashboard data loading function:', error);
        setError({ main: error.message || 'Unknown error occurred' });
        
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          toast.error('Session expired. Please login again.');
          navigate('/login');
        } else {
          toast.error(error.response?.data?.message || 'Failed to load dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Quick statistics calculation
  const stats = {
    totalStores: dashboardData.stores?.length || 0,
    totalProducts: dashboardData.products?.length || 0,
    totalUsers: dashboardData.users?.length || 0,
    activeUsers: dashboardData.users?.filter(u => u.banned === 0)?.length || 0
  };

  // Filter function based on search term
  const filterData = (items, searchKey) => {
    if (!searchTerm || !items) return items || [];
    
    // Log what we're filtering for debugging
    console.log(`Filtering ${items.length} items with search term "${searchTerm}" using key "${searchKey}"`);
    
    return items.filter(item => {
      // First check if the searchKey exists on the item
      if (!item[searchKey]) {
        console.log(`Item missing ${searchKey} property:`, item);
        return false;
      }
      
      // Then do the search
      return item[searchKey].toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  // Display debug information if there are errors
  const renderDebugInfo = () => {
    if (!error) return null;
    
    return (
      <div className="mt-4 p-4 border border-red-300 bg-red-50 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">Debug Information</h3>
        <pre className="mt-2 text-sm text-red-700 overflow-auto max-h-40">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  };

  // Check if user is admin
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isSupplier = user?.role?.toLowerCase() === 'supplier';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiHome className="mr-2 text-[#00796B]" /> 
            {isAdmin ? 'Admin Dashboard' : 'Supplier Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name || (isAdmin ? 'Admin' : 'Supplier')}!
          </p>
          <div className="mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {user?.role || 'User'} View
            </span>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Display any debug information */}
      {renderDebugInfo()}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6 mb-8`}>
            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-[#00796B]">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 mr-4">
                  <FiShoppingBag className="h-6 w-6 text-[#00796B]" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    {isSupplier ? 'My Stores' : 'Total Stores'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStores}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <FiGrid className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    {isSupplier ? 'My Products' : 'Total Products'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>
            
            {isAdmin && (
              <>
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 mr-4">
                      <FiUsers className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-100 mr-4">
                      <FiBarChart2 className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Monthly Sales</p>
                      <p className="text-2xl font-bold text-gray-900">
                        <FiTrendingUp className="inline h-5 w-5 text-green-500 mr-1" />
                        12%
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {isSupplier && (
              <div className="bg-white rounded-xl shadow p-6 border-l-4 border-orange-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100 mr-4">
                    <FiTrendingUp className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Store Performance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      <FiTrendingUp className="inline h-5 w-5 text-green-500 mr-1" />
                      8.5%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stores List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <FiShoppingBag className="mr-2 text-[#00796B]" /> 
                    {isSupplier ? 'My Stores' : 'Stores'}
                  </h2>
                  <button 
                    onClick={() => navigate('/stores')}
                    className="text-sm text-[#00796B] hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="px-6 py-4">
                  {filterData(dashboardData.stores, 'store_name').slice(0, 5).map((store, index) => (
                    <div key={store.id || index} className="flex items-center py-3 border-b border-gray-100 last:border-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                        {store.image ? (
                          <img 
                            src={store.image} 
                            alt={store.store_name} 
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.innerText = store.store_name?.charAt(0) || 'S';
                            }}
                          />
                        ) : (
                          <span className="text-gray-500 font-medium">{store.store_name?.charAt(0) || 'S'}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{store.store_name}</h3>
                        <p className="text-xs text-gray-500">{store.address || 'No address'}</p>
                      </div>
                      <div className="ml-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {filterData(dashboardData.stores, 'store_name').length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">
                        {isSupplier ? 'No stores found. Create your first store!' : 'No stores found'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Products List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <FiPackage className="mr-2 text-[#00796B]" /> 
                    {isSupplier ? 'My Products' : 'Products'}
                  </h2>
                  <button 
                    onClick={() => navigate('/products')}
                    className="text-sm text-[#00796B] hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Product
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Price
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Category
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Stock
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
  {dashboardData.products.length > 0 ? (
    filterData(dashboardData.products, 'product_name').slice(0, 6).map((product, index) => {
      const displayImage = getProductDisplayImage(product);
      
      return (
        <tr key={product.id || index} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                {displayImage ? (
                  <img 
                    src={displayImage} 
                    alt={product.product_name} 
                    className="h-10 w-10 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      // Replace with placeholder or fallback to text
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span 
                  className={`h-full w-full flex items-center justify-center text-sm font-medium ${displayImage ? 'hidden' : 'flex'}`}
                >
                  {product.product_name?.charAt(0) || 'P'}
                </span>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {product.product_name}
                </div>
                
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">${product.price || '0.00'}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {product.category || 'Uncategorized'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              product.stock > 0 
                ? product.stock > 10 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {product.stock || 0} units
            </span>
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
        {isSupplier ? 'No products found. Add your first product!' : 'No products found'}
      </td>
    </tr>
  )}
</tbody>
  </table>
  
  {dashboardData.products.length > 0 && filterData(dashboardData.products, 'product_name').length === 0 && (
    <div className="text-center py-8">
      <p className="text-gray-500 text-sm">No matching products found</p>
    </div>
  )}
</div>
              </div>
            </div>
          </div>
          
          {/* Bottom Section - Users List (Admin Only) */}
          {isAdmin && (
            <div className="mt-8 bg-white rounded-xl shadow overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiUsers className="mr-2 text-[#00796B]" /> All Users
                </h2>
                <button 
                  onClick={() => navigate('/users')}
                  className="text-sm text-[#00796B] hover:underline"
                >
                  Manage Users
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.users.length > 0 ? (
                      filterData(dashboardData.users, 'first_name')
                        .slice(0, 10)
                        .map((user, index) => (
                          <tr key={user.id || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                  {user.profile_image ? (
                                    <img 
                                      src={user.profile_image} 
                                      alt={`${user.first_name} ${user.last_name}`} 
                                      className="h-10 w-10 rounded-full"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.innerText = user.first_name?.charAt(0) || 'U';
                                      }}
                                    />
                                  ) : (
                                    <span>{user.first_name?.charAt(0) || 'U'}</span>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.first_name} {user.last_name}
                                  </div>
                                  {user.phone_number && (
                                    <div className="text-xs text-gray-500">
                                      {user.phone_number}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role?.toLowerCase() === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                user.role?.toLowerCase() === 'supplier' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role || 'user'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.banned === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.banned === 0 ? 'Active' : 'Banned'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.wilaya || 'N/A'}
                            </td>
                           
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                {dashboardData.users.length > 0 && filterData(dashboardData.users, 'first_name').length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No matching users found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;