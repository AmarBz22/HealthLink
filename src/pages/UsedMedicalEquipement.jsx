import { useState, useEffect } from 'react';
import { FiPackage, FiShoppingCart, FiArrowRight, FiSearch, FiFilter, FiPlus, FiUser, FiUsers, FiCamera, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';
import AddToCartModal from '../components/AddToCartModal';
import ImageSearchComponent from '../components/ImageSearch';
import { useBasket } from '../context/BasketContext';

const UsedMedicalEquipmentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [usedEquipments, setUsedEquipments] = useState([]);
  const [productOwnership, setProductOwnership] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [ownershipFilter, setOwnershipFilter] = useState(''); // New filter for ownership
  const [deletingProductId, setDeletingProductId] = useState(null);
  const storageUrl = 'http://192.168.43.101:8000/storage';
  
  // Image search states
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Add state for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Get the basket context
  const { addToBasket, toggleBasket } = useBasket();
  
  // Categories for medical equipment
  const categories = [
  "Diagnostic Devices",       // ECG, ultrasound, thermometers
  "Surgical Instruments",     // Scalpels, forceps, scissors
  "Monitoring Equipment",     // BP monitors, oximeters, heart rate monitors
  "Therapeutic Equipment",    // Nebulizers, infusion pumps
  "Mobility Aids",            // Wheelchairs, walkers, crutches
  "Durable Medical Equipment"
  ];  
  // Condition options
  const conditions = ["excellent", "very good", "good", "fair", "poor"];

  useEffect(() => {
    const fetchUsedEquipments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          toast.error('Please login to view used equipment');
          navigate('/login');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };

        // Direct API call to fetch all products
        const productsResponse = await axios.get('http://192.168.43.101:8000/api/products', { headers });
        
        // Filter products to only show those with type="used_equipment"
        const filteredProducts = Array.isArray(productsResponse.data) 
          ? productsResponse.data.filter(product => product.type === "used_equipment")
          : [];
        
        setUsedEquipments(filteredProducts);
        
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
        console.error('Error loading used equipment:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
        toast.error(error.response?.data?.message || 'Failed to load used equipment');
      } finally {
        setLoading(false);
      }
    };

    fetchUsedEquipments();
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
  
        setUsedEquipments(prev => prev.filter(p => p.product_id !== product.product_id));
        toast.success('Equipment deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete equipment');
      } finally {
        setDeletingProductId(null);
      }
    }
  };



  // Handler for adding to cart - opens the modal
  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  
  // Handler for when the modal is closed
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Image search handlers - search only within used equipment
  const handleSearchResults = (results) => {
    // Filter the search results to only include used equipment
    const equipmentSearchResults = results.filter(result => 
      usedEquipments.some(equipment => equipment.product_id === result.product_id)
    );
    
    setSearchResults(equipmentSearchResults);
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

  // Determine which products to display
  const baseProducts = searchResults.length > 0 ? searchResults : usedEquipments;
  const isShowingSearchResults = hasSearched && searchResults.length > 0;
  const isShowingNoResults = hasSearched && searchResults.length === 0;

  // Filter products based on search term, category, condition, and ownership
  const filteredProducts = baseProducts.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === '' || 
      product.category === filterCategory;
    
    const matchesCondition = filterCondition === '' ||
      product.condition === filterCondition;
    
    const isOwner = productOwnership[product.product_id] || false;
    const matchesOwnership = ownershipFilter === '' || 
      (ownershipFilter === 'my' && isOwner) ||
      (ownershipFilter === 'others' && !isOwner);
    
    return matchesSearch && matchesCategory && matchesCondition && matchesOwnership;
  });

  // Count products for filter badges (only from original used equipment)
  const myProductsCount = usedEquipments.filter(product => 
    productOwnership[product.product_id] || false
  ).length;
  
  const otherProductsCount = usedEquipments.filter(product => 
    !(productOwnership[product.product_id] || false)
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiPackage className="mr-2 text-[#00796B]" /> Used Medical Equipment
        </h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-[#00796B] hover:underline"
          >
            <FiArrowRight className="ml-1 transform rotate-180" /> Back
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {/* Status indicator */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="text-sm text-gray-500">
            {isShowingSearchResults ? (
              <span>
                {searchResults.length} search {searchResults.length === 1 ? 'result' : 'results'} found in used equipment
              </span>
            ) : isShowingNoResults ? (
              <span>No similar equipment found in used equipment listings</span>
            ) : (
              <span>
                {usedEquipments.length} used equipment {usedEquipments.length === 1 ? 'listing' : 'listings'} available
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
                <FiCamera className="mr-2" size={16} /> Search Equipment by Image
              </button>
            )}

            {/* Reset Search Results */}
            {(isShowingSearchResults || isShowingNoResults) && (
              <button
                onClick={resetImageSearch}
                className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FiX className="mr-2" size={16} /> Show All Equipment
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
              placeholder="Search equipment..."
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

          <div className="relative w-full lg:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent"
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
            >
              <option value="">All Conditions</option>
              {conditions.map((condition, index) => (
                <option key={index} value={condition}>{condition}</option>
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
              <option value="">All Equipment</option>
              <option value="my">My Equipment ({myProductsCount})</option>
              <option value="others">Other Equipment ({otherProductsCount})</option>
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
            All ({usedEquipments.length})
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
            My Equipment ({myProductsCount})
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
            Other Equipment ({otherProductsCount})
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
        // Pass used equipment to limit search scope
        limitToProducts={usedEquipments}
      />

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
        </div>
      ) : (
        <>
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
                  onAddToCart={handleAddToCart}
                  onViewDetails={(product) => navigate(`/products/${product.product_id}`)}
                  showInventoryPrice={false} // Different from inventory - might show different pricing
                  showCondition={true} // Show condition badge for used equipment
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
                  ? 'No equipment found in your listings'
                  : ownershipFilter === 'others'
                  ? 'No other equipment found'
                  : 'No used medical equipment found'
                }
              </h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || filterCategory || filterCondition || ownershipFilter
                  ? "Try adjusting your search or filter criteria"
                  : "Be the first to list your medical equipment for sale"}
              </p>
              {ownershipFilter !== 'others' && (
                <button
                  onClick={() => navigate('/used-equipment/add')}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
                >
                  <FiShoppingCart className="mr-2" /> Add New Equipment
                </button>
              )}
            </div>
          )}

          {/* Results Count */}
          {filteredProducts.length > 0 && (
            <div className="mt-8 text-center text-gray-600">
              Showing {filteredProducts.length} of {usedEquipments.length} used equipment listings
            </div>
          )}
        </>
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

export default UsedMedicalEquipmentPage;