import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingCart, 
  FiPackage, 
  FiStar, 
  FiChevronRight,
  FiTrendingUp,
  FiSearch,
  FiShield
} from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import AddToCartModal from '../components/AddToCartModal';
import StoreCard from '../components/StoreCard';

const HomePage = () => {
  const navigate = useNavigate();
  
  // State variables
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [cartItems, setCartItems] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Check login status on component mount
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      setIsLoggedIn(!!token);
      setCurrentUserId(userId ? parseInt(userId) : null);
    };
    
    checkLoginStatus();
  }, []);
  
  // Helper function to safely parse JSON response
  const safeJsonParse = async (response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('Failed to parse JSON response:', text);
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    }
  };
  
  // Fetch all data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products from API with better error handling
        let productsData = [];
        try {
          const productsResponse = await fetch('http://localhost:8000/api/products');
          
          if (!productsResponse.ok) {
            throw new Error(`Products API returned ${productsResponse.status}: ${productsResponse.statusText}`);
          }
          
          productsData = await safeJsonParse(productsResponse);
          console.log('Successfully fetched products:', productsData.length);
        } catch (error) {
          console.error('Error fetching products:', error);
          // Continue with empty array - will fall back to mock data
        }
        
        // Fetch stores from API with better error handling
        let storesData = [];
        try {
          const storesResponse = await fetch('http://localhost:8000/api/stores');
          
          if (!storesResponse.ok) {
            throw new Error(`Stores API returned ${storesResponse.status}: ${storesResponse.statusText}`);
          }
          
          storesData = await safeJsonParse(storesResponse);
          console.log('Successfully fetched stores:', storesData.length);
        } catch (error) {
          console.error('Error fetching stores:', error);
          // Continue with empty array - will fall back to mock data
        }
        
        // Mock categories (unchanged)
        const mockCategories = [
          {
            id: 1,
            name: 'Medications',
            icon: <FiPackage />,
            image: '/api/placeholder/150/150'
          },
          {
            id: 2,
            name: 'Medical Equipment',
            icon: <FiPackage />,
            image: '/api/placeholder/150/150'
          },
          {
            id: 3,
            name: 'Lab Supplies',
            icon: <FiPackage />,
            image: '/api/placeholder/150/150'
          },
          {
            id: 4,
            name: 'Healthcare Devices',
            icon: <FiPackage />,
            image: '/api/placeholder/150/150'
          },
          {
            id: 5,
            name: 'Personal Protective Equipment',
            icon: <FiPackage />,
            image: '/api/placeholder/150/150'
          },
          {
            id: 6,
            name: 'Supplements',
            icon: <FiPackage />,
            image: '/api/placeholder/150/150'
          }
        ];

        // Create trending products only if we have products data
        let trendingProductsList = [];
        if (productsData.length > 0) {
          const shuffledProducts = [...productsData].sort(() => 0.5 - Math.random());
          trendingProductsList = shuffledProducts.slice(0, 6);
        }
        
        // Set state with fetched or empty data
        setFeaturedProducts(productsData);
        setTrendingProducts(trendingProductsList);
        setTopStores(storesData);
        setCategories(mockCategories);
        setLoading(false);
        
        // If no data was fetched, show a message
        if (productsData.length === 0 && storesData.length === 0) {
          console.warn('No data could be fetched from APIs. Please check your backend server.');
        }
        
      } catch (error) {
        console.error('Error in fetchData:', error);
        fallbackToMockData();
      }
    };
    
    fetchData();
  }, []);

  // Fallback function to use mock data if API fails
  const fallbackToMockData = () => {
    console.log('Falling back to mock data');
    
    const mockCategories = [
      {
        id: 1,
        name: 'Medications',
        icon: <FiPackage />,
        image: '/api/placeholder/150/150'
      },
      {
        id: 2,
        name: 'Medical Equipment',
        icon: <FiPackage />,
        image: '/api/placeholder/150/150'
      },
      {
        id: 3,
        name: 'Lab Supplies',
        icon: <FiPackage />,
        image: '/api/placeholder/150/150'
      },
      {
        id: 4,
        name: 'Healthcare Devices',
        icon: <FiPackage />,
        image: '/api/placeholder/150/150'
      },
      {
        id: 5,
        name: 'Personal Protective Equipment',
        icon: <FiPackage />,
        image: '/api/placeholder/150/150'
      },
      {
        id: 6,
        name: 'Supplements',
        icon: <FiPackage />,
        image: '/api/placeholder/150/150'
      }
    ];
    
    setCategories(mockCategories);
    setTopStores([]);
    setFeaturedProducts([]);
    setTrendingProducts([]);
    setLoading(false);
  };

  // Event handlers
  const handleStoreClick = (store) => {
    navigate(`/stores/${store.id}`);
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };
  
  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { redirectAfter: '/home' } });
      return;
    }
    
    setSelectedProduct(product);
    setCartModalOpen(true);
  };
  
  const handleAddToBasket = (product) => {
    console.log('Adding to basket:', product);
    // Add to local cart state instead of API
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product_id === product.product_id);
      if (existingItem) {
        return prev.map(item => 
          item.product_id === product.product_id 
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };
  
  const handleOrderNow = (product) => {
    navigate('/checkout', { state: { products: [product] }});
  };
  

  
  const handleViewDetails = (product) => {
    navigate(`/products/${product.product_id}`);
  };

  const handleStoreDeleteSuccess = (deletedStoreId) => {
    setTopStores(prev => prev.filter(store => store.id !== deletedStoreId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* Platform Introduction */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to HealthLink
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The trusted marketplace connecting healthcare providers with verified medical suppliers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-[#B2DFDB] rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="text-2xl text-[#00796B]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Suppliers</h3>
              <p className="text-gray-600">
                All suppliers undergo rigorous verification to ensure quality and reliability
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-[#B2DFDB] rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShoppingCart className="text-2xl text-[#00796B]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Streamlined Ordering</h3>
              <p className="text-gray-600">
                Simplify your procurement process with our easy-to-use platform
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-[#B2DFDB] rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="text-2xl text-[#00796B]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitive Pricing</h3>
              <p className="text-gray-600">
                Access wholesale prices directly from manufacturers and distributors
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Categories */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Shop by Category
            </h2>
            <button
              onClick={() => navigate('/categories')}
              className="flex items-center text-[#00796B] hover:underline"
            >
              View All <FiChevronRight className="ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="bg-gray-50 rounded-xl p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="h-24 w-24 mx-auto mb-4 flex items-center justify-center rounded-full bg-white shadow-sm">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-16 w-16 object-contain"
                  />
                </div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Featured Products */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Products
            </h2>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center text-[#00796B] hover:underline"
            >
              View All <FiChevronRight className="ml-1" />
            </button>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  storageUrl="http://localhost:8000/storage"
                  onAddToCart={() => handleAddToCart(product)}
                  onViewDetails={() => handleViewDetails(product)}
                  className="h-full"
                  imageHeight="h-48"
                  isInCart={cartItems.some(item => item.product_id === product.product_id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No products available at the moment. Please check your backend server.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Top Stores */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Trusted Suppliers
            </h2>
            <button
              onClick={() => navigate('/stores')}
              className="flex items-center text-[#00796B] hover:underline"
            >
              View All <FiChevronRight className="ml-1" />
            </button>
          </div>
          
          {topStores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {topStores.slice(0, 8).map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  showDelete={false}
                  currentUserId={currentUserId}
                  onDeleteSuccess={handleStoreDeleteSuccess}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No stores available at the moment. Please check your backend server.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Trending Products */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Trending Now
            </h2>
            <button
              onClick={() => navigate('/trending')}
              className="flex items-center text-[#00796B] hover:underline"
            >
              View All <FiChevronRight className="ml-1" />
            </button>
          </div>
          
          {trendingProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {trendingProducts.slice(0, 6).map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  storageUrl="http://localhost:8000/storage"
                  onAddToCart={() => handleAddToCart(product)}
                  onViewDetails={() => handleViewDetails(product)}
                  className="h-full"
                  imageHeight="h-48"
                  isInCart={cartItems.some(item => item.product_id === product.product_id)}
                  showTrending={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No trending products available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        product={selectedProduct}
        onAddToBasket={handleAddToBasket}
        onOrderNow={handleOrderNow}
      />
    </div>
  );
};

export default HomePage;