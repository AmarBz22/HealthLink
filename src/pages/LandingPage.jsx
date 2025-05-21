import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingCart, 
  FiPackage, 
  FiStar, 
  FiChevronRight,
  FiTrendingUp,
  FiPercent,
  FiClock,
  FiAward,
  FiShield,
  FiX,
  FiLogIn
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard'; 

const LandingPage = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check login status on component mount
  useEffect(() => {
    // This is a placeholder - you should implement actual authentication check
    // For example, check for auth token in localStorage or sessionStorage
    const checkLoginStatus = () => {
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!token);
    };
    
    checkLoginStatus();
  }, []);
  
  // Fetch products and stores from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products from API
        const productsResponse = await fetch('http://localhost:8000/api/products');
        const productsData = await productsResponse.json();
        
        // Fetch stores from API
        const storesResponse = await fetch('http://localhost:8000/api/stores');
        const storesData = await storesResponse.json();
        
        // For categories, we'll use mock data for now since it's not in the API
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
        
        // Process store data with additional properties for UI
        const processedStores = storesData.map(store => ({
          ...store,
          logo: '/api/placeholder/80/80',
          verified: Math.random() > 0.3, // Random verification status for demo
          rating: (4 + Math.random()).toFixed(1), // Random rating between 4.0-5.0
          reviews: Math.floor(Math.random() * 1000) + 100, // Random number of reviews
          specialties: ['Medical Equipment', 'Healthcare Devices'] // Mock specialties
        }));
        
        setFeaturedProducts(productsData);
        setTopStores(processedStores);
        setCategories(mockCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        // If API fails, fall back to mock data
        fallbackToMockData();
      }
    };
    
    fetchData();
  }, []);

  // Fallback function to use mock data if API fails
  const fallbackToMockData = () => {
    
    // Mock categories (same as in the useEffect)
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
    setLoading(false);
  };

  // Handle store click - show modal or navigate to store page
  const handleStoreClick = (store) => {
    if (isLoggedIn) {
      navigate(`/stores/${store.id}`);
    } else {
      setSelectedItem(store);
      setModalType('store');
      setShowModal(true);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const redirectToLogin = () => {
    navigate('/login');
  };

  const redirectToRegister = () => {
    navigate('/register');
  };
  
  // Handle add to cart functionality
  const handleAddToCart = (product) => {
    if (isLoggedIn) {
      // Add to cart functionality
      console.log('Adding to cart:', product);
      
      // You would implement actual cart functionality here
      // For example:
      // addToCart(product);
      // showCartNotification();
      
      // Optionally navigate to cart page
      // navigate('/cart');
    } else {
      // Show login modal
      setSelectedItem(product);
      setModalType('product');
      setShowModal(true);
    }
  };
  
  // Handle view details functionality
  const handleViewDetails = (product) => {
    if (isLoggedIn) {
      // Navigate to product details page
      navigate(`/products/${product.product_id}`);
    } else {
      // Show login modal
      setSelectedItem(product);
      setModalType('product');
      setShowModal(true);
    }
  };

  // Connection Modal Component
  const ConnectionModal = () => {
    if (!showModal) return null;
    
    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {modalType === 'product' ? 'View Product Details' : 'View Store Details'}
            </h3>
            <button 
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="text-xl" />
            </button>
          </div>
          
          {selectedItem && (
            <div className="mb-6">
              {modalType === 'product' ? (
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden">
                    <img 
                      src={selectedItem.images && selectedItem.images.length > 0 
                        ? selectedItem.images[0].image_path 
                        : '/api/placeholder/300/200'} 
                      alt={selectedItem.product_name}
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedItem.product_name}</h4>
                    <p className="text-[#00796B] font-bold">${parseFloat(selectedItem.price).toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-gray-100 rounded-full overflow-hidden">
                    <img 
                      src={selectedItem.logo || '/api/placeholder/80/80'} 
                      alt={selectedItem.store_name}
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedItem.store_name}</h4>
                    {selectedItem.rating && (
                      <div className="flex items-center">
                        <FiStar className="text-yellow-400 mr-1" />
                        <span className="text-sm">{selectedItem.rating} ({selectedItem.reviews} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <FiLogIn className="text-4xl text-[#00796B]" />
            </div>
            <p className="text-gray-700 mb-2">
              Please connect to your account to {modalType === 'product' ? 'view product details and make purchases' : 'view store details and their products'}
            </p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={redirectToLogin}
              className="w-full py-3 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
            >
              Login
            </button>
            <button
              onClick={redirectToRegister}
              className="w-full py-3 border border-[#00796B] text-[#00796B] rounded-lg hover:bg-[#E0F2F1] transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Add Navbar Component */}
      <Navbar />
      
      {/* Hero Section (Search Removed) */}
      <div className="bg-[#00796B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Your One-Stop Medical Supplies Marketplace
            </h1>
            <p className="text-lg md:text-xl text-[#B2DFDB]">
              Connect with trusted suppliers for all your healthcare needs
            </p>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="flex justify-center mb-2">
                <FiShield className="text-2xl" />
              </div>
              <h3 className="font-medium">Verified Suppliers</h3>
              <p className="text-[#B2DFDB] text-sm">Quality assurance</p>
            </div>
            <div className="p-4">
              <div className="flex justify-center mb-2">
                <FiShoppingCart className="text-2xl" />
              </div>
              <h3 className="font-medium">1000+ Products</h3>
              <p className="text-[#B2DFDB] text-sm">All medical needs</p>
            </div>
            <div className="p-4">
              <div className="flex justify-center mb-2">
                <FiClock className="text-2xl" />
              </div>
              <h3 className="font-medium">Fast Delivery</h3>
              <p className="text-[#B2DFDB] text-sm">Get supplies quickly</p>
            </div>
            <div className="p-4">
              <div className="flex justify-center mb-2">
                <FiAward className="text-2xl" />
              </div>
              <h3 className="font-medium">Certified Products</h3>
              <p className="text-[#B2DFDB] text-sm">Medical grade quality</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Categories */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Categories
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
      
      {/* Special Offers */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Special Offers
            </h2>
            <button
              onClick={() => navigate('/offers')}
              className="flex items-center text-[#00796B] hover:underline"
            >
              View All <FiChevronRight className="ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-40 bg-[#E0F2F1] flex items-center justify-center p-4">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <FiPercent className="text-4xl text-[#00796B]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Bulk Discounts</h3>
                  <p className="text-[#00796B]">Save up to 25% on bulk orders</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-40 bg-[#E0F2F1] flex items-center justify-center p-4">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <FiClock className="text-4xl text-[#00796B]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Flash Sales</h3>
                  <p className="text-[#00796B]">Limited time offers every day</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-40 bg-[#E0F2F1] flex items-center justify-center p-4">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <FiTrendingUp className="text-4xl text-[#00796B]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">New Arrivals</h3>
                  <p className="text-[#00796B]">Latest products just in</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Popular Products - Now using ProductCard component */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Popular Products
            </h2>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center text-[#00796B] hover:underline"
            >
              View All <FiChevronRight className="ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                isOwner={false}
                storageUrl="http://localhost:8000/storage"
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewDetails}
                className="h-full"
                imageHeight="h-48"
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Trusted Stores */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Trusted Stores
            </h2>
            <button
              onClick={() => navigate('/stores')}
              className="flex items-center text-[#00796B] hover:underline"
            >
              View All <FiChevronRight className="ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topStores.map((store) => (
              <div
                key={store.id}
                onClick={() => handleStoreClick(store)}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    <img
                      src={store.logo || '/api/placeholder/80/80'}
                      alt={store.store_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-semibold text-gray-900">{store.store_name}</h3>
                      {store.verified && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#B2DFDB] text-[#00796B]">
                          <FiStar className="mr-1" /> Verified
                        </span>
                      )}
                    </div>
                    {store.rating && (
                      <div className="flex items-center mt-1">
                        <FiStar className="text-yellow-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{store.rating}</span>
                        <span className="mx-1 text-gray-300">|</span>
                        <span className="text-sm text-gray-500">{store.reviews} reviews</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {store.specialties && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {store.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#E0F2F1] text-[#00796B]"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Getting Started */}
      <div className="py-12 bg-[#E0F2F1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How to Get Started
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our medical marketplace in just a few simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-[#B2DFDB] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-[#00796B]">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create an Account</h3>
              <p className="text-gray-600">
                Sign up for free and complete your profile to get started
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-[#B2DFDB] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-[#00796B]">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Products</h3>
              <p className="text-gray-600">
                Browse categories or search for specific medical supplies
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-[#B2DFDB] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-[#00796B]">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Order & Receive</h3>
              <p className="text-gray-600">
                Place orders and get your medical supplies delivered
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors shadow-md text-lg font-medium"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
      
      {/* Connection Modal */}
      <ConnectionModal />
    </div>
  );
};

export default LandingPage;