import { useState, useEffect } from 'react';
import { FiPackage, FiShoppingCart, FiArrowRight, FiSearch, FiFilter, FiPlus, FiUser, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';
import AddToCartModal from '../components/AddToCartModal';
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
  const storageUrl = 'http://localhost:8000/storage';
  
  // Add state for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Get the basket context
  const { addToBasket, toggleBasket } = useBasket();
  
  // Categories for medical equipment
  const categories = ['Diagnostic', 'Monitoring', 'Surgical', 'Laboratory', 'Imaging', 'Dental', 'Other'];
  
  // Condition options
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'For Parts'];

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
        const productsResponse = await axios.get('http://localhost:8000/api/products', { headers });
        
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
                `http://localhost:8000/api/products/${product.product_id}/check-owner`, 
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
          `http://localhost:8000/api/product/${product.product_id}`, 
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

  const handleEditProduct = (product) => {
    navigate(`/used-equipment/${product.product_id}/edit`);
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

  // Filter products based on search term, category, condition, and ownership
  const filteredProducts = usedEquipments.filter(product => {
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

  // Count products for filter badges
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
            onClick={() => navigate('/used-equipment/add')}
            className="flex items-center px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
          >
            <FiPlus className="mr-2" /> Add Equipment
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-[#00796B] hover:underline"
          >
            <FiArrowRight className="ml-1 transform rotate-180" /> Back
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
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
      <div className="flex flex-wrap gap-2 mb-6">
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

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-3 gap-6">
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
                showInventoryPrice={false} // Different from inventory - might show different pricing
                showCondition={true} // Show condition badge for used equipment
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
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