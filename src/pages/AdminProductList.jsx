import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPackage, FiSearch, FiUser, FiCalendar, FiDollarSign, FiTag,
  FiShoppingBag, FiBarChart, FiEye, FiLayers, FiTrash2, FiAlertTriangle, FiRefreshCw, FiTrendingUp
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import DeleteProductModal from "../components/DeleteProductModal";

const AdminProductList = () => {
  const navigate = useNavigate();
  
  // Core state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [ownerNames, setOwnerNames] = useState({});
  const [storeNames, setStoreNames] = useState({});
  const [storeOwners, setStoreOwners] = useState({}); // Store owner information
  const [error, setError] = useState(null);
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    productId: null,
    productName: '',
    isDeleting: false
  });

  const storageUrl = 'http://192.168.43.102:8000/storage';
  const categories = [
    "Medical Equipment", "Medications", "Dental Supplies", "Lab Supplies",
    "Health & Wellness", "First Aid & Emergency", "Protective Gear", "Personal Care"
  ];
  const productTypes = ['inventory', 'new', 'used_equipment'];

  // Utility functions
  const handleApiError = (error, context = 'Operation') => {
    console.error(`${context} error:`, error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      navigate('/login');
      return 'Session expired. Please log in again.';
    }
    
    return error.response?.data?.message || `${context} failed. Please try again.`;
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? 'N/A' : `${numPrice.toFixed(2)} DZD`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getProductDisplayImage = (product) => {
    if (product.images?.length > 0) {
      const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
      return primaryImage.image_path;
    }
    return product.image || product.product_image || null;
  };

  const getTypeColor = (type) => {
    const colors = {
      inventory: 'bg-blue-100 text-blue-800',
      new: 'bg-green-100 text-green-800',
      used_equipment: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Delete functions
  const handleDeleteProduct = async (productId) => {
    if (!productId) return;

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://192.168.43.102:8000/api/admin/product/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setProducts(prev => prev.filter(product => product.id !== productId));
      toast.success('Product deleted successfully');
      closeDeleteModal();
    } catch (error) {
      const errorMessage = handleApiError(error, 'Delete product');
      toast.error(errorMessage);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const openDeleteModal = (product) => {
    if (!product?.id) return;
    setDeleteModal({
      show: true,
      productId: product.id,
      productName: product.name || 'Unknown Product',
      isDeleting: false
    });
  };

  const closeDeleteModal = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({ show: false, productId: null, productName: '', isDeleting: false });
    }
  };

  // Data fetching functions
  const fetchOwnerName = async (userId, token) => {
    if (!userId || ownerNames[userId]) return;

    try {
      const response = await axios.get(`http://192.168.43.102:8000/api/users/${userId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const userData = response.data;
      let ownerDisplayName = "Unknown User";
      
      if (userData.first_name && userData.last_name) {
        ownerDisplayName = `${userData.first_name} ${userData.last_name}`;
      } else if (userData.first_name) {
        ownerDisplayName = userData.first_name;
      } else if (userData.last_name) {
        ownerDisplayName = userData.last_name;
      } else if (userData.name) {
        ownerDisplayName = userData.name;
      } else if (userData.username) {
        ownerDisplayName = userData.username;
      } else if (userData.email) {
        ownerDisplayName = userData.email;
      }
      
      setOwnerNames(prev => ({ ...prev, [userId]: ownerDisplayName }));
    } catch (error) {
      console.error(`Error fetching owner name for user ${userId}:`, error);
      let fallbackName = "Unknown User";
      
      if (error.response?.status === 401) {
        fallbackName = "Unauthorized";
      } else if (error.response?.status === 404) {
        fallbackName = "User Not Found";
      } else if (error.response?.status === 403) {
        fallbackName = "Access Denied";
      }
      
      setOwnerNames(prev => ({ ...prev, [userId]: fallbackName }));
    }
  };

  const fetchStoreName = async (storeId, token) => {
    if (!storeId || storeNames[storeId]) return;

    try {
      const response = await axios.get(`http://192.168.43.102:8000/api/store/${storeId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const storeData = Array.isArray(response.data) 
        ? response.data[0] 
        : response.data?.data || response.data;
      
      const storeName = storeData?.store_name || storeData?.name || "Unknown Store";
      setStoreNames(prev => ({ ...prev, [storeId]: storeName }));
      
      // Also fetch store owner information if available
      if (storeData?.owner_id && !storeOwners[storeId]) {
        try {
          const ownerResponse = await axios.get(`http://192.168.43.102:8000/api/users/${storeData.owner_id}`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          const ownerData = ownerResponse.data;
          let storeOwnerName = "Unknown Owner";
          
          if (ownerData.first_name && ownerData.last_name) {
            storeOwnerName = `${ownerData.first_name} ${ownerData.last_name}`;
          } else if (ownerData.first_name) {
            storeOwnerName = ownerData.first_name;
          } else if (ownerData.last_name) {
            storeOwnerName = ownerData.last_name;
          } else if (ownerData.name) {
            storeOwnerName = ownerData.name;
          } else if (ownerData.username) {
            storeOwnerName = ownerData.username;
          } else if (ownerData.email) {
            storeOwnerName = ownerData.email;
          }
          
          setStoreOwners(prev => ({ ...prev, [storeId]: storeOwnerName }));
        } catch (ownerError) {
          console.error(`Error fetching store owner for store ${storeId}:`, ownerError);
          setStoreOwners(prev => ({ ...prev, [storeId]: "Unknown Owner" }));
        }
      }
    } catch (error) {
      console.error(`Error fetching store name for store ${storeId}:`, error);
      setStoreNames(prev => ({ ...prev, [storeId]: "Unknown Store" }));
    }
  };

  // Verify admin and fetch products
  useEffect(() => {
    const verifyAdminAndFetchProducts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          toast.error('Please login to access products');
          navigate('/login');
          return;
        }

        // Verify if user is admin
        const userResponse = await axios.get('http://192.168.43.102:8000/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (userResponse.data.role !== 'Admin') {
          toast.error('Unauthorized access. Admin privileges required.');
          return;
        }

        setIsAdmin(true);
        setCurrentAdminId(userResponse.data.id);

        // Fetch products if admin
        const response = await axios.get('http://192.168.43.102:8000/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const allProducts = (response.data || []).map(product => ({
          ...product,
          id: product.product_id || product.id,
          name: product.product_name || product.name || 'Unnamed Product',
          price: product.inventory_price || product.price || 0,
          stock: product.inventory_quantity || product.stock || 0,
          category: product.category || 'Uncategorized',
          type: product.type || 'unknown'
        }));

        setProducts(allProducts);

        // Fetch store information (including store owners)
        const uniqueStoreIds = [...new Set(allProducts.map(p => p.store_id).filter(Boolean))];
        await Promise.all(uniqueStoreIds.map(storeId => fetchStoreName(storeId, token)));
        
        // Fetch owner information for products that have user_id but no store_id
        const uniqueUserIds = [...new Set(
          allProducts
            .filter(p => p.user_id && !p.store_id)
            .map(p => p.user_id)
            .filter(Boolean)
        )];
        await Promise.all(uniqueUserIds.map(userId => fetchOwnerName(userId, token)));

      } catch (error) {
        const errorMessage = handleApiError(error, 'Load products');
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAndFetchProducts();
  }, [navigate]);

  // Get the display name for product owner (either direct owner or store owner)
  const getProductOwnerDisplay = (product) => {
    if (product.store_id) {
      const storeName = storeNames[product.store_id] || 'Loading...';
      const storeOwner = storeOwners[product.store_id] || 'Loading...';
      return {
        primary: storeName,
        secondary: `Owner: ${storeOwner}`,
        isStore: true
      };
    } else if (product.user_id) {
      const ownerName = ownerNames[product.user_id] || 'Loading...';
      return {
        primary: ownerName,
        secondary: `User ID: ${product.user_id}`,
        isStore: false
      };
    }
    return {
      primary: 'Unknown',
      secondary: 'No owner info',
      isStore: false
    };
  };

  // Filtered products
  const filteredProducts = products.filter(product => {
    const ownerInfo = getProductOwnerDisplay(product);
    
    const matchesSearch = [
      product.name, 
      product.description, 
      product.category, 
      ownerInfo.primary,
      ownerInfo.secondary,
      product.user_id?.toString(), 
      product.type
    ].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesType = filterType === 'all' || product.type === filterType;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Stats calculation
  const stats = {
    total: products.length,
    inventory: products.filter(p => p.type === 'inventory').length,
    new: products.filter(p => p.type === 'new').length,
    used_equipment: products.filter(p => p.type === 'used_equipment').length,
    totalValue: products.reduce((sum, p) => sum + (parseFloat(p.price) * parseInt(p.stock) || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B] mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Unauthorized Access</h2>
          <p className="text-gray-600 mb-4">You don't have permission to view this page.</p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-[#00796B] text-white rounded-md hover:bg-[#00695C] transition-colors"
          >
            Return to home page
          </button>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Error Loading Products</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => verifyAdminAndFetchProducts()}
            className="px-4 py-2 bg-[#00796B] text-white rounded-md hover:bg-[#00695C] transition-colors flex items-center mx-auto"
          >
            <FiRefreshCw className="mr-2" />
            Try Again
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
            <FiLayers className="mr-2 text-[#00796B]" />
            All Products
          </h1>
          <p className="text-gray-600 mt-1">Manage and monitor all platform products</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00796B]"
          >
            <option value="all">All Types</option>
            {productTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00796B]"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00796B]"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[
          { title: 'Total Products', value: stats.total, icon: FiPackage, color: 'border-blue-500' },
          { title: 'Inventory', value: stats.inventory, icon: FiBarChart, color: 'border-blue-400' },
          { title: 'New', value: stats.new, icon: FiShoppingBag, color: 'border-green-500' },
          { title: 'Used Equipment', value: stats.used_equipment, icon: FiTrendingUp, color: 'border-yellow-500' },
          { title: 'Total Value', value: `${(stats.totalValue/1000).toFixed(1)}K DZD`, icon: FiDollarSign, color: 'border-orange-500' }
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
            <FiPackage className="text-gray-400 text-3xl mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-700 mb-2">No Products Found</h2>
            <p className="text-gray-500">
              {searchQuery || filterCategory !== 'all' || filterType !== 'all'
                ? 'Try adjusting your search or filter criteria.' 
                : 'No products are currently available.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type & Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner/Store</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price & Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const displayImage = getProductDisplayImage(product);
                  const ownerInfo = getProductOwnerDisplay(product);
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden">
                            {displayImage ? (
                              <img 
                                className="h-12 w-12 object-cover" 
                                src={displayImage}
                                alt={product.name}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`h-12 w-12 bg-[#00796B] flex items-center justify-center ${displayImage ? 'hidden' : 'flex'}`}>
                              <FiPackage className="text-white text-lg" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(product.type)}`}>
                          {product.type.replace('_', ' ')}
                        </span>
                        <div className="text-xs text-gray-500 flex items-center mt-2">
                          <FiTag className="mr-1" />
                          {product.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            {ownerInfo.isStore ? (
                              <FiShoppingBag className="mr-2 text-gray-400" />
                            ) : (
                              <FiUser className="mr-2 text-gray-400" />
                            )}
                            <span className="font-medium">{ownerInfo.primary}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {ownerInfo.secondary}
                          </div>
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
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="text-[#00796B] hover:text-[#00695C]"
                            title="View Product"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete Product"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      {deleteModal.show && (
        <DeleteProductModal
          show={deleteModal.show}
          productName={deleteModal.productName}
          onClose={closeDeleteModal}
          onConfirm={() => handleDeleteProduct(deleteModal.productId)}
          isDeleting={deleteModal.isDeleting}
        />
      )}
    </div>
  );
};

export default AdminProductList;