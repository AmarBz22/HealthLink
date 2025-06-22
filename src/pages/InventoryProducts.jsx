import { useState, useEffect } from 'react';
import { FiPackage, FiShoppingCart, FiArrowRight, FiSearch, FiFilter, FiUser, FiUsers, FiCamera, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';
import AddToCartModal from '../components/AddToCartModal';
import ImageSearchComponent from '../components/ImageSearch';
import { useBasket } from '../context/BasketContext';

const InventoryProductsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [productOwnership, setProductOwnership] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [ownershipFilter, setOwnershipFilter] = useState('');
  const [deletingProductId, setDeletingProductId] = useState(null);
  const storageUrl = 'http://192.168.43.101:8000/storage';
  
  // User role state (kept for display purposes but not for authorization)
  const [userRole, setUserRole] = useState(null);
  
  // Image search states
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Get the basket context
  const { addToBasket, toggleBasket } = useBasket();
  
  // Categories for filter dropdown
  const categories = ['Medications', 'Electronics', 'Clothing', 'Food', 'Beauty', 'Other'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
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

        // Get user role for display purposes (no authorization check)
        try {
          const userResponse = await axios.get('http://192.168.43.101:8000/api/user', { headers });
          setUserRole(userResponse.data.role);
        } catch (error) {
          console.warn('Could not fetch user role:', error);
        }

        // Fetch inventory products - accessible to all authenticated users
        const productsResponse = await axios.get('http://192.168.43.101:8000/api/products', { headers });
        
        // Filter products to only show those with type="inventory"
        const filteredProducts = Array.isArray(productsResponse.data) 
          ? productsResponse.data.filter(product => product.type === "inventory")
          : [];
        
        setInventoryProducts(filteredProducts);
        
        // For each product, check ownership status
        const ownershipChecks = {};
        await Promise.all(
          filteredProducts.map(async (product) => {
            try {
              const ownershipResponse = await axios.get(
                `http://192.168.43.101:8000/api/products/${product.product_id}/check-owner`, 
                { headers }
              );
              ownershipChecks[product.product_id] = ownershipResponse.data.isOwner || false;
            } catch (error) {
              console.error(`Error checking ownership for product ${product.product_id}:`, error);
              ownershipChecks[product.product_id] = false;
            }
          })
        );
        
        setProductOwnership(ownershipChecks);
      } catch (error) {
        console.error('Error loading inventory:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        } else {
          toast.error(error.response?.data?.message || 'Failed to load inventory products');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate]);

  const handleDeleteProduct = async (product) => {
    if (!product?.product_id) {
      console.error("Invalid product data");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete "${product.product_name}"? This action cannot be undone.`)) {
      try {
        setDeletingProductId(product.product_id);
        const token = localStorage.getItem('authToken');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };
  
        await axios.delete(
          `http://192.168.43.101:8000/api/product/${product.product_id}`, 
          { headers }
        );
  
        setInventoryProducts(prev => prev.filter(p => p.product_id !== product.product_id));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete product');
      } finally {
        setDeletingProductId(null);
      }
    }
  };

  const handleEditProduct = (product) => {
    navigate(`/store/${product.store_id}/products/${product.product_id}/edit`);
  };

  // Updated handleAddToCart - now opens the modal
  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  
  // Handler for when the modal is closed
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Image search handlers - MODIFIED to search only within inventory products
  const handleSearchResults = (results) => {
    // Filter the search results to only include inventory products
    const inventorySearchResults = results.filter(result => 
      inventoryProducts.some(invProduct => invProduct.product_id === result.product_id)
    );
    
    setSearchResults(inventorySearchResults);
    setHasSearched(true);
  };

  const handleResetSearch = () => {
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleCloseSearch = () => {
    setShowImageSearch(false);
    setSearchResults([]);
    setHasSearched(false);
  };

  const resetImageSearch = () => {
    setShowImageSearch(false);
    setSearchResults([]);
    setHasSearched(false);
  };

  // Helper function to check if current user owns a specific product
  const isOwnerOfProduct = (productId) => {
    return productOwnership[productId] || false;
  };

  // Helper function to get all products owned by current user
  const getMyProducts = () => {
    return inventoryProducts.filter(product => 
      productOwnership[product.product_id] || false
    );
  };

  // Helper function to get products owned by others
  const getOtherProducts = () => {
    return inventoryProducts.filter(product => 
      !(productOwnership[product.product_id] || false)
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
      </div>
    );
  }

  // Determine which products to display
  const baseProducts = searchResults.length > 0 ? searchResults : inventoryProducts;
  const isShowingSearchResults = hasSearched && searchResults.length > 0;
  const isShowingNoResults = hasSearched && searchResults.length === 0;

  // Filter products based on search term, category, and ownership
  const filteredProducts = baseProducts.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === '' || 
      product.category === filterCategory;
    
    const isOwner = productOwnership[product.product_id] || false;
    const matchesOwnership = ownershipFilter === '' || 
      (ownershipFilter === 'my' && isOwner) ||
      (ownershipFilter === 'others' && !isOwner);
    
    return matchesSearch && matchesCategory && matchesOwnership;
  });

  // Count products for filter badges (only from original inventory)
  const myProductsCount = inventoryProducts.filter(product => 
    productOwnership[product.product_id] || false
  ).length;
  
  const otherProductsCount = inventoryProducts.filter(product => 
    !(productOwnership[product.product_id] || false)
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiPackage className="mr-2 text-[#00796B]" /> Inventory Products
        </h1>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-[#00796B] hover:underline"
        >
          <FiArrowRight className="ml-1 transform rotate-180" /> Back
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {/* Status indicator */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="text-sm text-gray-500">
            {isShowingSearchResults ? (
              <span>
                {searchResults.length} search {searchResults.length === 1 ? 'result' : 'results'} found in inventory
              </span>
            ) : isShowingNoResults ? (
              <span>No similar products found in inventory</span>
            ) : (
              <span>
                {inventoryProducts.length} inventory {inventoryProducts.length === 1 ? 'product' : 'products'} available
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Image Search Button */}
            {!showImageSearch && (
              <button
                onClick={() => setShowImageSearch(true)}
                className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FiCamera className="mr-2" size={16} /> Search Inventory by Image
              </button>
            )}

            {/* Reset Search Results */}
            {(isShowingSearchResults || isShowingNoResults) && (
              <button
                onClick={resetImageSearch}
                className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FiX className="mr-2" size={16} /> Show All Inventory
              </button>
            )}
          </div>
        </div>

        {/* Traditional Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent"
              placeholder="Search inventory products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative w-full lg:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Ownership Filter */}
          <div className="relative w-full lg:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="text-gray-400" />
            </div>
            <select
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent"
              value={ownershipFilter}
              onChange={(e) => setOwnershipFilter(e.target.value)}
            >
              <option value="">All Products</option>
              <option value="my">My Products ({myProductsCount})</option>
              <option value="others">Other Products ({otherProductsCount})</option>
            </select>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setOwnershipFilter('')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              ownershipFilter === '' 
                ? 'bg-[#00796B] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({inventoryProducts.length})
          </button>
          <button
            onClick={() => setOwnershipFilter('my')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center ${
              ownershipFilter === 'my' 
                ? 'bg-[#00796B] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiUser className="w-3 h-3 mr-1" />
            My Products ({myProductsCount})
          </button>
          <button
            onClick={() => setOwnershipFilter('others')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center ${
              ownershipFilter === 'others' 
                ? 'bg-[#00796B] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiUsers className="w-3 h-3 mr-1" />
            Other Products ({otherProductsCount})
          </button>
        </div>
      </div>

      {/* Image Search Component */}
      <ImageSearchComponent
        isVisible={showImageSearch}
        searchResults={searchResults}
        hasSearched={hasSearched}
        onSearchResults={handleSearchResults}
        onReset={handleResetSearch}
        onClose={handleCloseSearch}
        // Pass inventory products to limit search scope
        limitToProducts={inventoryProducts}
      />

      {/* Products Grid */}
      {!isShowingNoResults && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              isOwner={productOwnership[product.product_id] || false}
              storageUrl={storageUrl}
              deletingProductId={deletingProductId}
              onDeleteProduct={handleDeleteProduct}
              onEditProduct={handleEditProduct}
              onAddToCart={handleAddToCart}
              onViewDetails={(product) => navigate(`/products/${product.product_id}`)}
              showInventoryPrice={true}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && !isShowingNoResults && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <FiPackage className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            {ownershipFilter === 'my' 
              ? 'No products found in your inventory'
              : ownershipFilter === 'others'
              ? 'No other products found'
              : 'No inventory products found'
            }
          </h3>
          <p className="mt-1 text-gray-500">
            {searchTerm || filterCategory || ownershipFilter
              ? "Try adjusting your search or filter criteria"
              : "Your inventory is currently empty"}
          </p>
          {ownershipFilter !== 'others' && (
            <button
              onClick={() => navigate('/inventory/add')}
              className="mt-4 inline-flex items-center px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
            >
              <FiShoppingCart className="mr-2" /> Add New Products
            </button>
          )}
        </div>
      )}
      
      {/* Add To Cart Modal */}
      <AddToCartModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </div>
  );
};

export default InventoryProductsPage;