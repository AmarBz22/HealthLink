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
import StoreCard from '../components/StoreCard'; // Import the StoreCard component

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
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  // Add new state for cart modal
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Check login status on component mount
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
      setIsLoggedIn(!!token);
      setCurrentUserId(userId ? parseInt(userId) : null);
    };
    
    checkLoginStatus();
  }, []);
  
  // Fetch all data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products from API
        const productsResponse = await fetch('http://localhost:8000/api/products');
        const productsData = await productsResponse.json();
        
        // Fetch stores from API
        const storesResponse = await fetch('http://localhost:8000/api/stores');
        const storesData = await storesResponse.json();
        
        // Mock categories only
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

        // Create a subset of trending products (different from featured)
        const shuffledProducts = [...productsData].sort(() => 0.5 - Math.random());
        const trendingProductsList = shuffledProducts.slice(0, 6);
        
        // If user is logged in, fetch wishlist and cart
        if (isLoggedIn) {
          try {
            // Simulate fetching wishlist and cart items (replace with actual API calls)
            const wishlistResponse = await fetch('http://localhost:8000/api/wishlist', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
              }
            });
            const wishlistData = await wishlistResponse.json();
            setWishlistItems(wishlistData);
            
            const cartResponse = await fetch('http://localhost:8000/api/cart', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
              }
            });
            const cartData = await cartResponse.json();
            setCartItems(cartData);
          } catch (error) {
            console.error('Error fetching user data:', error);
            // Fallback to empty arrays if API calls fail
            setWishlistItems([]);
            setCartItems([]);
          }
        }
        
        setFeaturedProducts(productsData);
        setTrendingProducts(trendingProductsList);
        setTopStores(storesData); // Use API data directly
        setCategories(mockCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        // If API fails, fall back to mock data
        fallbackToMockData();
      }
    };
    
    fetchData();
  }, [isLoggedIn]);

  // Fallback function to use mock data if API fails
  const fallbackToMockData = () => {
    // Mock categories only
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
    setTopStores([]); // Empty stores if API fails
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
    
    // Open the cart modal with the selected product
    setSelectedProduct(product);
    setCartModalOpen(true);
  };
  
  const handleAddToBasket = (product) => {
    // Add to cart functionality
    console.log('Adding to basket:', product);
    
    // In a real implementation, you would call an API endpoint
    // For demo purposes, we'll update the local state
    setCartItems(prev => [...prev, product]);
    
    // Show success notification (you would implement this)
    // showNotification('Product added to cart successfully');
  };
  
  const handleOrderNow = (product) => {
    navigate('/checkout', { state: { products: [product] }});
  };
  
  const handleAddToWishlist = (product) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { redirectAfter: '/home' } });
      return;
    }
    
    // Add to wishlist functionality
    console.log('Adding to wishlist:', product);
    
    // In a real implementation, you would call an API endpoint
    // For demo purposes, we'll update the local state
    setWishlistItems(prev => [...prev, product]);
    
    // Show success notification (you would implement this)
    // showNotification('Product added to wishlist successfully');
  };
  
  const handleViewDetails = (product) => {
    navigate(`/products/${product.product_id}`);
  };

  const handleStoreDeleteSuccess = (deletedStoreId) => {
    // Remove the deleted store from the topStores state
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                isOwner={false}
                storageUrl="http://localhost:8000/storage"
                onAddToCart={() => handleAddToCart(product)}
                onAddToWishlist={() => handleAddToWishlist(product)}
                onViewDetails={() => handleViewDetails(product)}
                className="h-full"
                imageHeight="h-48"
                isInWishlist={wishlistItems.some(item => item.product_id === product.product_id)}
                isInCart={cartItems.some(item => item.product_id === product.product_id)}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Top Stores - Using StoreCard Component */}
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {topStores.slice(0, 8).map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                showDelete={false} // Don't show delete option on homepage
                currentUserId={currentUserId}
                onDeleteSuccess={handleStoreDeleteSuccess}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Trending Products */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-centers mb-8">
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {trendingProducts.slice(0, 6).map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                isOwner={false}
                storageUrl="http://localhost:8000/storage"
                onAddToCart={() => handleAddToCart(product)}
                onAddToWishlist={() => handleAddToWishlist(product)}
                onViewDetails={() => handleViewDetails(product)}
                className="h-full"
                imageHeight="h-48"
                isInWishlist={wishlistItems.some(item => item.product_id === product.product_id)}
                isInCart={cartItems.some(item => item.product_id === product.product_id)}
                showTrending={true}
              />
            ))}
          </div>
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