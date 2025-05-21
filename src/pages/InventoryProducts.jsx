import { useState, useEffect } from 'react';
import { FiPackage, FiShoppingCart, FiArrowRight, FiSearch, FiFilter } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';
import AddToCartModal from '../components/AddToCartModal'; // Import the modal
import { useBasket } from '../context/BasketContext'; // Import the basket context

const InventoryProductsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [productOwnership, setProductOwnership] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [deletingProductId, setDeletingProductId] = useState(null);
  const storageUrl = 'http://localhost:8000/storage';
  
  // Add state for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Get the basket context
  const { addToBasket, toggleBasket } = useBasket();
  
  // Categories for filter dropdown
  const categories = ['Medications', 'Electronics', 'Clothing', 'Food', 'Beauty', 'Other'];

  useEffect(() => {
    const fetchInventoryProducts = async () => {
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

        // Direct API call to fetch all products
        const productsResponse = await axios.get('http://localhost:8000/api/products', { headers });
        
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
        console.error('Error loading inventory:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
        toast.error(error.response?.data?.message || 'Failed to load inventory products');
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryProducts();
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
    navigate(`/inventory/products/${product.product_id}/edit`);
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

  // Filter products based on search term and category
  const filteredProducts = inventoryProducts.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === '' || 
      product.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

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

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative w-full md:w-64">
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
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
        </div>
      ) : (
        <>
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

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <FiPackage className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No inventory products found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || filterCategory 
                  ? "Try adjusting your search or filter criteria"
                  : "Your inventory is currently empty"}
              </p>
              <button
                onClick={() => navigate('/inventory/add')}
                className="mt-4 inline-flex items-center px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
              >
                <FiShoppingCart className="mr-2" /> Add New Products
              </button>
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

export default InventoryProductsPage;